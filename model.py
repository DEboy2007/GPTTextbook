import openai
import os

# Set up OpenAI API credentials
with open(".env", "r") as f:
    key = f.read()

openai.api_key = key


def ask_gpt(prompt):
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=3000,
        n=1,
        stop=None,
        temperature=0.5,
    )
    message = response.choices[0].text.strip()
    return message


print(ask_gpt("What were the factors which caused the rise of fascism before WW2?"))
