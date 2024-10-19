from dotenv import load_dotenv
import os
import requests
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq

# Load environment variables
load_dotenv()

# Define the function for getting places
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
    if response.status_code == 200:
        return response.text
    else:
        return f"Error: {response.status_code} - {response.text}"

# Register the tool using LangChain
get_places_tool = Tool(
    name="get_places",
    func=get_places,
    description="Retrieves the name and place ID given a text query."
)

# Initialize the ChatGroq client
llm = ChatGroq(model_name="llama3-groq-70b-8192-tool-use-preview")

# Define the initial prompt template
prompt_template = """
Find a relevant website with attractions in San Diego, then scrape from one website 5 attractions in San Diego, California, in a list format.
"""

# Create a prompt for the initial task
initial_prompt = PromptTemplate(
    template=prompt_template,
    input_variables=[]
)

# Initialize the LLM chain
initial_chain = GroqClient(llm=llm, prompt=initial_prompt)

# Create the agent executor with ChatGroq and the registered tool
agent_executor = AgentExecutor(
    tools=[get_places_tool],
    llm=llm,
    verbose=True
)

# Define the main function to execute the chain
def main():
    # Run the initial chain
    initial_response = initial_chain.run()
    print("Initial Response:", initial_response)

    # Assuming we extract the attractions from the initial response
    attractions = ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4", "Attraction 5"]

    # Query the get_places tool for each attraction
    for attraction in attractions:
        response = agent_executor.run({"input": attraction})
        print("Place ID Response:", response)

# Execute the main function
if __name__ == "__main__":
    main()
