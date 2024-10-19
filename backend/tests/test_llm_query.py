from dotenv import load_dotenv
from groq import Groq
import requests
from toolhouse import Toolhouse
import os

th = Toolhouse()

load_dotenv()

MODEL = "llama3-groq-70b-8192-tool-use-preview"

@th.register_local_tool("get_places")
def get_places(query: str) -> str:
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "X-Goog-Api-Key": os.getenv('GOOGLE_API_KEY'),
        "X-Goog-FieldMask": "places.displayName,places.id"
    }
    data = {
        "textQuery": query,
        "locationBias": {
            "circle": {
                "center": {
                "latitude": 32.715736,
                "longitude": -117.161087
                },
                "radius": 500.0
            }
        }
    }

    response = requests.post(url, headers=headers, json=data)
    print(query)
    
    if response.status_code == 200:
        return response.text
    else:
        return f"Error: {response.status_code} - {response.text}"

my_local_tools = [
    {
        "type": "function",
        "function": {
            "name": "get_places",
            "description": "Retrieves the name, and place id in the world given a text query",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query to find relevant place information",
                    },
                    "required": [
                        "query"
                    ],
                },
            },
        },
    }
]

messages = [
    {
        "role": "system",
        "content": """Find a relevant website with attractions in San Diego, then scrape from one website 5 attractions in San Diego, California, 
        in a list format."""
    }
]

client = Groq()

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
        "content": """Query these attractions in given and return a list of their place ids using
        the places information tool"""
    }
]

print(messages)

response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    max_tokens=1000,
    tools=th.get_tools() + my_local_tools,
)

tool_run = th.run_tools(response)
messages = messages + tool_run
messages += [
    {
        "role": "user",
        "content": """return a list of only place IDs, do not include any other information. For example
        a valid output would be
        
        [id1, id2, id3, id4, id5]
        
        """
    }
]
print(messages)

response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    max_tokens=1000
)

print(response.choices[0].message.content)