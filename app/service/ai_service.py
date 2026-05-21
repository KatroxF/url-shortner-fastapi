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
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.7,
        max_completion_tokens=1024
    )
    return completion.choices[0].message.content