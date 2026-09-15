#### **🌍 Travel AI Assistant**



An AI-powered worldwide travel planning assistant that generates personalized day-by-day travel itineraries based on the destination, number of days, number of travelers, and user interests.



#### **🚀 Project Overview**



The Travel AI Assistant helps users plan trips using Artificial Intelligence.



Users can:



\- Create an account and log in securely

\- Enter any travel destination around the world

\- Select the number of days

\- Specify the number of travelers

\- Enter their interests

\- Generate a personalized itinerary

\- View the itinerary in a structured and user-friendly interface

\- Save generated trips to MongoDB Atlas



The application uses a multi-layer architecture consisting of a Next.js frontend, Node.js gateway, FastAPI backend, OpenAI API, Firebase Authentication, and MongoDB Atlas.



\---

#### **🏗️ System Architecture**



&#x20;                   User

&#x20;                    │

&#x20;                    ▼

&#x20;           Next.js Frontend

&#x20;                    │

&#x20;                    ▼

&#x20;         Firebase Authentication

&#x20;                    │

&#x20;                    ▼

&#x20;          Node.js Gateway

&#x20;           / Middleware

&#x20;                    │

&#x20;                    ▼

&#x20;             FastAPI Backend

&#x20;                    │

&#x20;                    ▼

&#x20;               OpenAI API

&#x20;                    │

&#x20;                    ▼

&#x20;            MongoDB Atlas

#### 

#### **🛠️ Technologies Used**



Implemented

Next.js

React

TypeScript

Tailwind CSS

Firebase Authentication

Node.js

Express.js

FastAPI

Python

OpenAI API

MongoDB Atlas

Studied / Documented for Future Enhancement

MongoDB Vector Search

Pinecone

Redis

Docker

Google Cloud Platform

LangChain

Google ADK

Agentic AI / Agent Skills



These technologies are documented as part of the curriculum but are not required for the current working MVP.

#### 

#### **✨ Main Features**



###### **🔐 Authentication**



Users can create an account and log in using Firebase Email/Password Authentication.



Authentication is handled through a dedicated login/signup page.



🌎 Worldwide Destination Support



Users can enter destinations freely instead of being limited to a predefined list of locations.



Examples include:



Paris

Tokyo

Dubai

New York

Bali

Jaipur

London

#### **🗓️ AI Itinerary Generation**



The system generates a structured itinerary containing:



Morning activities

Afternoon activities

Evening activities

Food recommendations

Daily travel tips

General travel tips



###### **💾 Trip Storage**



Generated itineraries are saved in MongoDB Atlas and associated with the authenticated user.

###### 

###### **🔄 Application Flow**



User enters trip details

&#x20;       ↓

Firebase verifies user

&#x20;       ↓

Next.js sends authenticated request

&#x20;       ↓

Node.js Gateway receives request

&#x20;       ↓

Firebase ID token is verified

&#x20;       ↓

Node.js forwards request to FastAPI

&#x20;       ↓

FastAPI validates request

&#x20;       ↓

FastAPI sends prompt to OpenAI

&#x20;       ↓

OpenAI generates structured itinerary

&#x20;       ↓

FastAPI returns itinerary

&#x20;       ↓

Node.js saves itinerary to MongoDB

&#x20;       ↓

Node.js returns response to frontend

&#x20;       ↓

Next.js displays itinerary



#### **🔒 Security**



The project uses Firebase Authentication to protect travel planning requests.



The Firebase ID token is sent from the frontend to the Node.js gateway using:



Authorization: Bearer <Firebase ID Token>



The Node.js gateway verifies the token using Firebase Admin SDK before forwarding the request.



Sensitive files and environment variables are excluded from Git using .gitignore.



Examples include:



.env

.env.local

serviceAccountKey.json

node\_modules

Python virtual environments



#### **🗄️ MongoDB Storage**



Generated trips are stored in the trips collection inside MongoDB Atlas.



Each trip contains information such as:



userId

userEmail

destination

days

travelers

interests

itinerary

createdAt



This allows generated travel plans to be associated with the authenticated user.

#### 

#### **🤖 AI Integration**



The FastAPI backend communicates directly with the OpenAI API.



The AI is instructed to return a structured itinerary containing the required fields.



Structured JSON output allows the Next.js frontend to display the itinerary as organized day cards instead of plain text.



#### **▶️ Running the Project**



The application currently consists of three main services.



1\. Start the FastAPI Backend

cd fastapi-backend

.\\.venv\\Scripts\\Activate.ps1

uvicorn main:app --reload --port 8000



2\. Start the Node.js Gateway



Open another terminal:



cd node-gateway

npm run dev



3\. Start the Next.js Frontend



Open another terminal:



cd frontend

npm run dev



Then open the local URL shown by Next.js in the browser.

### 

#### **Future Enhancements**



MongoDB Vector Search

Pinecone-based semantic search

Redis caching

Docker deployment

GCP deployment

LangChain workflows

Google ADK

Agentic AI capabilities

