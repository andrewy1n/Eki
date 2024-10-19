from groq import Groq
from toolhouse import Toolhouse

def get_place_names(location: str):
    th = Toolhouse()
    
    client = Groq()
    MODEL = "llama3-groq-70b-8192-tool-use-preview"

    messages = [
        {
            "role": "system",
            "content": f"""Find a relevant website with attractions in {location}, then scrape from one website 5 attractions in {location}, 
            in a list format."""
        }
    ]

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        max_tokens=1000,
        tools=th.get_tools()
    )

    tool_run = th.run_tools(response)
    messages = messages + tool_run
    messages += [
        {
            "role": "user",
            "content": """Return a list of the names of 5 attractions in a list format,
            ex. [place1, place2, place3, place4, place5]"""
        }
    ]

    print(messages)
    
    final_response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        max_tokens=1000
    )

    return final_response.choices[0].message.content.strip().strip('[]').split(',')