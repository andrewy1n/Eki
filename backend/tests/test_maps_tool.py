from dotenv import load_dotenv
from groq import Groq
import requests
from toolhouse import Toolhouse
import os

load_dotenv()

th = Toolhouse()

MODEL = "llama3-groq-70b-8192-tool-use-preview"

@th.register_local_tool("get_places_info")
def get_places_info(query: str) -> str:
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "X-Goog-Api-Key": os.getenv('GOOGLE_API_KEY'),
        "X-Goog-FieldMask": "places.displayName,places.location,places.id"
    }
    data = {
        "textQuery": query
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
            "name": "get_places_info",
            "description": "Retrieves the information on places in the world",
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
    "role": "user",
    "content": """Make one API call to retrieve relevant places information based on an interest in basketball in San Diego, CA, and pick 5 
        of those places that would be the smoothest, and return the 'id' field in a list, 
        ex. ["ChIJwWB_qT2uEmsRbE92vXMyX4Q", "ChIJs5ydyTiuEmsR0fRSlU0C7k0", "ChIJs5ydyTiuEmsR0fRfrgerU0C7k0", "ChIJs5ydyTiuEmsR012dSlU0C7k0", "C12ds5ydyTiuEmsR0fRSlU0C7k0"]""",
  }
]

client = Groq()

response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    max_tokens=1000,
    tools=th.get_tools(),
)

tool_run = th.run_tools(response)
messages = messages + tool_run

response = client.chat.completions.create(
    model=MODEL,
    messages=messages,
    max_tokens=1000,
    tools=th.get_tools(),
)

print(response.choices[0].message.content)