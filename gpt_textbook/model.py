import openai
import json

# Set up OpenAI API credentials
openai.api_key = "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"


def generate_text(prompt):
    try:
        # Use Davinci model to generate text
        completions = openai.Completion.create(
            engine="davinci",
            prompt=prompt,
            max_tokens=50,
            n=1,
            stop=None,
            temperature=0.5,
        )
        # Return the generated text
        return completions.choices[0].text
    except Exception as e:
        print(f"Error: {e}")
        return ""


if __name__ == "__main__":
    # Test the function
    response = generate_text("Book: Math\nUser Input: What is 2+2?\nAI:")
    print(response)
