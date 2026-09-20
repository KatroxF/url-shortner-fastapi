import json
import logging

from groq import Groq, BadRequestError, RateLimitError, APIConnectionError
from sqlalchemy.orm import Session

from app.core.config import GROQ_API_KEY
from app.service import tools

logger = logging.getLogger(__name__)

client = Groq(api_key=GROQ_API_KEY)
MODEL = "openai/gpt-oss-120b"
MAX_TOOL_ROUNDS = 3  # how many times the model may request tools


def _tool(name: str, description: str):
    # No url_id here: the server injects it, the model never sees it
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    }


tool_definitions = [
    _tool("get_total_clicks", "Get the total number of clicks for this link."),
    _tool("get_unique_visitors", "Get the number of unique visitors to this link."),
    _tool("get_top_referrers", "Get the top 5 referrers (where clicks came from)."),
    _tool("get_geo_distribution", "Get the top 5 countries by clicks."),
    _tool("get_peak_hours", "Get clicks by hour of day (UTC), busiest first."),
    _tool("get_device_stats", "Get clicks grouped by device operating system."),
]

available_functions = {
    "get_total_clicks": tools.get_total_clicks,
    "get_unique_visitors": tools.get_unique_visitors,
    "get_top_referrers": tools.get_top_referrers,
    "get_geo_distribution": tools.get_geo_distribution,
    "get_peak_hours": tools.get_peak_hours,
    "get_device_stats": tools.get_device_stats,
}

SYSTEM_PROMPT = (
    "You are an analytics assistant for a URL shortener. "
    "Answer the user's question about their link using the available functions. "
    "Never guess numbers; always fetch them with a function. "
    "Use plain English and keep it short. "
    "For a direct question, answer in one or two sentences. "
    "For a broad request like 'give me insights', use at most 5 short bullet points. "
    "If the question is not about link analytics, say you can only help with that."
)


def _chat(**kwargs):
    # Retry once on flaky tool calls, rate limits or connection errors
    for attempt in range(2):
        try:
            return client.chat.completions.create(**kwargs)
        except (BadRequestError, RateLimitError, APIConnectionError):
            logger.exception("Groq call failed (attempt %s)", attempt + 1)
            if attempt == 1:
                raise


def _run_tool(name: str, url_id: int, db: Session):
    function = available_functions.get(name)
    if function is None:
        return {"error": "Unknown tool"}
    try:
        # url_id and db come from the server, never from the model
        return function(url_id=url_id, db=db)
    except Exception:
        logger.exception("Tool %s failed", name)
        db.rollback()  # clears a failed transaction so later queries work
        return {"error": "Could not fetch this data"}


def ask_ai(prompt: str, url_id: int, db: Session) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    # Rounds 0..MAX_TOOL_ROUNDS-1 allow tools; the last round has no tools,
    # so the model must write its final answer.
    for round_number in range(MAX_TOOL_ROUNDS + 1):
        allow_tools = round_number < MAX_TOOL_ROUNDS

        params = dict(
            model=MODEL,
            messages=messages,
            temperature=0.3,
            max_completion_tokens=1024,
        )
        if allow_tools:
            params["tools"] = tool_definitions
            params["tool_choice"] = "auto"

        response = _chat(**params)
        message = response.choices[0].message

        # No tool requested -> this is the final answer
        if not message.tool_calls:
            return message.content or ""

        messages.append({
            "role": "assistant",
            "content": message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments or "{}",
                    },
                }
                for tc in message.tool_calls
            ],
        })

        for tool_call in message.tool_calls:
            result = _run_tool(tool_call.function.name, url_id, db)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result, default=str),
            })

    return "Sorry, I couldn't finish that analysis. Please try again."