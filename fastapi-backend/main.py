import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field


load_dotenv()

app = FastAPI(
    title="Travel AI Assistant API",
    description="AI-powered backend for the Travel AI Assistant",
    version="1.0.0",
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")

if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is missing. Add it to fastapi-backend/.env"
    )

client = OpenAI(api_key=OPENAI_API_KEY)


class TravelRequest(BaseModel):
    destination: str = Field(..., min_length=2)
    days: int = Field(..., ge=1, le=30)
    travelers: int = Field(..., ge=1, le=20)
    interests: list[str] = Field(default_factory=list)


@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "FastAPI backend is running",
    }


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

Create exactly {request.days} itinerary days.

For every day provide:

- Day number
- A short title
- Morning activities
- Afternoon activities
- Evening activities
- Food recommendations
- Useful tips for that day

Also provide:

- A short trip summary
- General travel tips

Important requirements:

1. Make the itinerary realistic for the destination.
2. Do not overcrowd the day.
3. Consider the user's interests.
4. Include local experiences where appropriate.
5. Suggest realistic food experiences.
6. Do not invent exact ticket prices.
7. Do not invent exact opening hours.
8. Do not invent current hotel availability.
9. Do not invent current flight prices.
10. If something depends on current information, say it should be verified.
11. Keep each section concise and useful.
12. Return ONLY the requested structured JSON.
"""

    schema = {
        "type": "object",
        "properties": {
            "destination": {
                "type": "string"
            },
            "summary": {
                "type": "string"
            },
            "days": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "day": {
                            "type": "integer"
                        },
                        "title": {
                            "type": "string"
                        },
                        "morning": {
                            "type": "string"
                        },
                        "afternoon": {
                            "type": "string"
                        },
                        "evening": {
                            "type": "string"
                        },
                        "food": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "tips": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    },
                    "required": [
                        "day",
                        "title",
                        "morning",
                        "afternoon",
                        "evening",
                        "food",
                        "tips"
                    ],
                    "additionalProperties": False
                }
            },
            "travel_tips": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            }
        },
        "required": [
            "destination",
            "summary",
            "days",
            "travel_tips"
        ],
        "additionalProperties": False
    }

    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            input=prompt,
            text={
                "format": {
                    "type": "json_schema",
                    "name": "travel_itinerary",
                    "strict": True,
                    "schema": schema,
                }
            },
        )

        itinerary_text = response.output_text

        itinerary = json.loads(itinerary_text)

        return {
            "success": True,
            "destination": request.destination,
            "days": request.days,
            "travelers": request.travelers,
            "itinerary": itinerary,
        }

    except json.JSONDecodeError as error:
        print("JSON parsing error:", error)

        raise HTTPException(
            status_code=500,
            detail="AI returned an invalid itinerary format.",
        )

    except Exception as error:
        print("OpenAI error:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to generate the travel itinerary.",
        )