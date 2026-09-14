"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

const suggestions = [
  "5 day trip to Paris",
  "Weekend in Bali",
  "7 days in Japan",
  "Best places in Switzerland",
];

const destinations = [
  {
    name: "Japan",
    location: "Tokyo • Kyoto • Osaka",
    emoji: "🇯🇵",
    className: "japan",
  },
  {
    name: "Bali",
    location: "Indonesia",
    emoji: "🌴",
    className: "bali",
  },
  {
    name: "Europe",
    location: "Paris • Rome • Switzerland",
    emoji: "🏛️",
    className: "europe",
  },
];

type TravelResponse = {
  success?: boolean;
  gateway?: string;
  requestId?: string;
  data?: {
    success?: boolean;
    message?: string;
    request?: {
      destination?: string;
      days?: number;
      travelers?: number;
      interests?: string[];
    };
  };
  error?: unknown;
};

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [planResponse, setPlanResponse] =
    useState<TravelResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * Check whether the user is signed in.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  /*
   * Logout from Firebase.
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out. Please try again.");
    }
  };

  /*
   * Send the user's travel request to:
   *
   * Next.js → Node.js → FastAPI
   */
  const startPlanning = async (text?: string) => {
    const destination = text || prompt;

    if (!destination.trim()) {
      setErrorMessage(
        "Tell me where you want to travel first!"
      );
      return;
    }

    setIsPlanning(true);
    setErrorMessage("");
    setPlanResponse(null);

    try {
      /*
       * For this first connection test, we send a simple
       * default travel request to the backend.
       *
       * Later, OpenAI will understand natural-language
       * prompts such as:
       *
       * "Plan a 5 day trip to Paris for two people"
       */
      const response = await fetch(
        "http://localhost:5000/api/plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination: destination,
            days: 5,
            travelers: 2,
            interests: [],
          }),
        }
      );

      const data: TravelResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          "The travel request could not be processed."
        );
      }

      setPlanResponse(data);
    } catch (error) {
      console.error("Trip planning failed:", error);

      setErrorMessage(
        "Unable to connect to the travel assistant. Make sure Node.js and FastAPI are running."
      );
    } finally {
      setIsPlanning(false);
    }
  };

  /*
   * While Firebase is checking the user's session,
   * don't show the dashboard.
   */
  if (checkingAuth) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f3eb",
          color: "#173f35",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "35px",
              marginBottom: "12px",
            }}
          >
            ✈️
          </div>

          <p style={{ margin: 0 }}>
            Checking your JourneyBuddy account...
          </p>
        </div>
      </main>
    );
  }

  /*
   * This prevents the dashboard from rendering
   * if there is no authenticated user.
   */
  if (!user) {
    return null;
  }

  const displayName =
    user.displayName ||
    user.email?.split("@")[0] ||
    "Traveller";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <main className="dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <Link href="/" className="dashboard-logo">
          ✈️ <span>JourneyBuddy</span>
        </Link>

        <nav className="sidebar-nav">

          <a className="nav-item active">
            <span>⌂</span>
            Home
          </a>

          <a className="nav-item">
            <span>🗺</span>
            My Trips
          </a>

          <a className="nav-item">
            <span>♡</span>
            Saved Places
          </a>

          <a className="nav-item">
            <span>⚙</span>
            Settings
          </a>

        </nav>

        <div className="sidebar-bottom">

          <div className="profile">

            <div className="profile-avatar">
              {avatarLetter}
            </div>

            <div>
              <strong>{displayName}</strong>

              <small>
                {user.email}
              </small>
            </div>

          </div>

          <button
            type="button"
            className="logout"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN DASHBOARD
      ========================= */}

      <section className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <span className="eyebrow">
              GOOD DAY, TRAVELLER ✨
            </span>

            <h1>
              Where will your
              <br />
              <span>next adventure</span> take you?
            </h1>

          </div>

          <div className="header-avatar">
            {avatarLetter}
          </div>

        </header>

        {/* =========================
            AI PLANNER
        ========================= */}

        <section className="planner-box">

          <div className="planner-icon">
            ✈️
          </div>

          <div className="planner-content">

            <span className="planner-label">
              ASK JOURNEYBUDDY
            </span>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tell me where you want to go..."
              rows={2}
              disabled={isPlanning}
            />

            <div className="planner-bottom">

              <div className="suggestion-list">

                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setPrompt(suggestion)}
                    disabled={isPlanning}
                  >
                    {suggestion}
                  </button>
                ))}

              </div>

              <button
                type="button"
                className="plan-button"
                onClick={() => startPlanning()}
                disabled={isPlanning}
              >
                {isPlanning
                  ? "Planning..."
                  : "Plan my trip →"}
              </button>

            </div>

          </div>

        </section>

        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {errorMessage && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px 20px",
              borderRadius: "14px",
              background: "#fff1f0",
              color: "#b42318",
              border: "1px solid #fecdca",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* =========================
            BACKEND RESPONSE
        ========================= */}

        {planResponse && (
          <section
            className="section"
            style={{
              marginTop: "30px",
            }}
          >

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  TRIP REQUEST RECEIVED ✨
                </span>

                <h2>
                  Your travel request
                </h2>

              </div>

            </div>

            <div
              style={{
                padding: "28px",
                borderRadius: "20px",
                background: "#ffffff",
                border: "1px solid rgba(23, 63, 53, 0.1)",
                boxShadow:
                  "0 10px 30px rgba(23, 63, 53, 0.06)",
              }}
            >

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >

                <div>
                  <strong>Destination</strong>
                  <p style={{ margin: "5px 0 0" }}>
                    {planResponse.data?.request?.destination ||
                      prompt}
                  </p>
                </div>

                <div>
                  <strong>Duration</strong>
                  <p style={{ margin: "5px 0 0" }}>
                    {planResponse.data?.request?.days || 5} days
                  </p>
                </div>

                <div>
                  <strong>Travellers</strong>
                  <p style={{ margin: "5px 0 0" }}>
                    {planResponse.data?.request?.travelers || 2}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "16px",
                    borderTop:
                      "1px solid rgba(23, 63, 53, 0.1)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      opacity: 0.65,
                    }}
                  >
                    ✓ Request successfully passed through
                    Node.js → FastAPI
                  </span>
                </div>

              </div>

            </div>

          </section>
        )}

        {/* =========================
            POPULAR DESTINATIONS
        ========================= */}

        <section className="section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                GET INSPIRED
              </span>

              <h2>
                Popular adventures
              </h2>

            </div>

            <button type="button">
              Explore all →
            </button>

          </div>

          <div className="destination-grid">

            {destinations.map((destination) => (

              <button
                key={destination.name}
                type="button"
                className={`destination-card ${destination.className}`}
                onClick={() =>
                  startPlanning(
                    `5 day trip to ${destination.name}`
                  )
                }
                disabled={isPlanning}
              >

                <span className="destination-emoji">
                  {destination.emoji}
                </span>

                <div>

                  <h3>
                    {destination.name}
                  </h3>

                  <p>
                    {destination.location}
                  </p>

                </div>

                <span className="destination-arrow">
                  ↗
                </span>

              </button>

            ))}

          </div>

        </section>

        {/* =========================
            RECENT TRIPS
        ========================= */}

        <section className="section recent-section">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                YOUR JOURNEYS
              </span>

              <h2>
                Recent trips
              </h2>

            </div>

          </div>

          <div className="empty-trips">

            <div>
              🧳
            </div>

            <h3>
              Your adventures will appear here
            </h3>

            <p>
              Start planning your first trip and your
              saved itineraries will show up here.
            </p>

            <button
              type="button"
              onClick={() => {
                setPrompt("5 day trip to Paris");

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              Plan my first trip →
            </button>

          </div>

        </section>

      </section>

    </main>
  );
}

