import os
from dotenv import load_dotenv
from groq import Groq
from app.core.config import GROQ_API_KEY
load_dotenv()
client = Groq(
    api_key=GROQ_API_KEY
)
def ask_ai(prompt:str):
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",

        messages=[
            {
                "role": "system",
                "content": (
                    "You are an analytics assistant for a URL shortener app."
                    "Generate short and simple traffic insights from analytics data."
                    "Output rules:"
                    "1.  Use plain English"
                    "2. Maximum 5 bullet points."
                    "3. One sentence per bullet."
                    "4. No tables, No headings,No technical jargon,Keep it human and easy to read"
                     

                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.3,
        max_completion_tokens=300
    )
    return completion.choices[0].message.content
