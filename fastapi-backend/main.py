import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field


# Load environment variables from .env
load_dotenv()


# Create FastAPI application
app = FastAPI(
    title="Travel AI Assistant API",
    description="AI-powered backend for the Travel AI Assistant",
    version="1.0.0",
)


# Read OpenAI configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")


# Make sure the API key exists
if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is missing. Add it to fastapi-backend/.env"
    )


# Create OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)


# Request model
class TravelRequest(BaseModel):
    destination: str = Field(..., min_length=2)
    days: int = Field(..., ge=1, le=30)
    travelers: int = Field(..., ge=1, le=20)
    interests: list[str] = Field(default_factory=list)


# Health check
@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "FastAPI backend is running",
    }


# AI travel planning endpoint
@app.post("/api/plan")
def create_travel_plan(request: TravelRequest):

    interests_text = ", ".join(request.interests)

    if not interests_text:
        interests_text = (
            "general sightseeing, local food, culture, "
            "and memorable experiences"
        )

    prompt = f"""
You are JourneyBuddy, an intelligent worldwide travel planning assistant.

Create a practical and enjoyable travel itinerary.

Trip details:

Destination: {request.destination}
Number of days: {request.days}
Number of travelers: {request.travelers}
Interests: {interests_text}

Requirements:

1. Create a day-by-day itinerary.
2. Include realistic activities for each day.
3. Organize activities into morning, afternoon, and evening.
4. Suggest local food or dining experiences.
5. Include useful travel tips.
6. Avoid unnecessarily packing too many activities into one day.
7. Make the itinerary suitable for the destination.
8. Do not invent exact ticket prices, opening hours,
   flight prices, or hotel availability.
9. If something depends on current information,
   clearly say that it should be verified.
10. Make the response friendly and easy for a traveller to read.

Return the itinerary in clear Markdown.
"""

    try:

        response = client.responses.create(
            model=OPENAI_MODEL,
            input=prompt,
        )

        itinerary = response.output_text

        return {
            "success": True,
            "destination": request.destination,
            "days": request.days,
            "travelers": request.travelers,
            "itinerary": itinerary,
        }

    except Exception as error:

        print("OpenAI error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to generate the travel itinerary.",
        )