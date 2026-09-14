"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";

type DayPlan = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  food: string[];
  tips: string[];
};

type Itinerary = {
  destination: string;
  summary: string;
  days: DayPlan[];
  travel_tips: string[];
};

type TravelResponse = {
  success: boolean;
  destination: string;
  days: number;
  travelers: number;
  itinerary: Itinerary;
};

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [interests, setInterests] = useState("");

  const [isPlanning, setIsPlanning] = useState(false);
  const [planResponse, setPlanResponse] =
    useState<TravelResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Check Firebase authentication
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

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  // Generate travel plan
  const startPlanning = async () => {
    if (!destination.trim()) {
      setErrorMessage("Please enter a destination.");
      return;
    }

    setIsPlanning(true);
    setPlanResponse(null);
    setErrorMessage("");

    try {
      const interestsArray = interests
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      // Get Firebase ID token
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

      // Send authenticated request to Node.js
      const response = await fetch("http://localhost:5000/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          destination: destination.trim(),
          days,
          travelers,
          interests: interestsArray,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error?.detail ||
            data?.error ||
            "Unable to generate your travel plan."
        );
      }

      setPlanResponse(data.data);
    } catch (error) {
      console.error("Planning error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your itinerary."
      );
    } finally {
      setIsPlanning(false);
    }
  };

  const suggestions = [
    "5 day trip to Paris",
    "Weekend in Bali",
    "7 days in Japan",
    "Best places in Switzerland",
  ];

  const useSuggestion = (suggestion: string) => {
    const match = suggestion.match(/^(\d+)\s+day/i);

    if (match) {
      setDays(Number(match[1]));
    }

    const destinationMatch = suggestion.match(
      /(?:trip to|in|places in)\s+(.+)$/i
    );

    if (destinationMatch) {
      setDestination(destinationMatch[1]);
    }
  };

  // Authentication loading screen
  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-white/70">Checking your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            ✈️ JourneyBuddy
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.displayName || "Traveller"}
              </p>

              <p className="text-xs text-white/50">{user?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            🌍 AI-powered travel planning
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Plan your next adventure
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/60">
            Tell JourneyBuddy where you want to go, and let AI create a
            personalized itinerary for your trip.
          </p>
        </div>

        {/* PLANNER */}
        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Where do you want to go?
              </label>

              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    startPlanning();
                  }
                }}
                placeholder="Paris, Tokyo, Bali, Mangalore..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Number of days
                </label>

                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Travelers
                </label>

                <input
                  type="number"
                  min={1}
                  max={20}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Interests
              </label>

              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="food, history, beaches, shopping..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
              />

              <p className="mt-2 text-xs text-white/40">
                Separate multiple interests with commas.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              onClick={startPlanning}
              disabled={isPlanning}
              className="mt-2 rounded-2xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlanning ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/20 border-t-slate-950" />
                  Creating your itinerary...
                </span>
              ) : (
                "✨ Plan My Trip"
              )}
            </button>
          </div>
        </div>

        {/* SUGGESTIONS */}
        <div className="mx-auto mt-6 max-w-4xl">
          <p className="mb-3 text-sm text-white/40">Try one of these:</p>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => useSuggestion(suggestion)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* RESULT */}
        {planResponse && (
          <section className="mx-auto mt-14 max-w-6xl">
            {/* SUMMARY */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-6 shadow-2xl sm:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/40">
                    Your AI-generated trip
                  </p>

                  <h2 className="mt-2 text-4xl font-bold sm:text-5xl">
                    🌍 {planResponse.itinerary.destination}
                  </h2>

                  <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">
                    {planResponse.itinerary.summary}
                  </p>
                </div>

                <div className="flex shrink-0 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center">
                    <p className="text-3xl font-bold">
                      {planResponse.days}
                    </p>

                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Days
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center">
                    <p className="text-3xl font-bold">
                      {planResponse.travelers}
                    </p>

                    <p className="text-xs uppercase tracking-wider text-white/40">
                      Travelers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DAY CARDS */}
            <div className="mt-8 space-y-6">
              {planResponse.itinerary.days.map((day) => (
                <article
                  key={day.day}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl"
                >
                  {/* DAY HEADER */}
                  <div className="border-b border-white/10 bg-white/[0.04] p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-950">
                        {day.day}
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                          Day {day.day}
                        </p>

                        <h3 className="mt-1 text-2xl font-bold">
                          {day.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* MORNING / AFTERNOON / EVENING */}
                  <div className="grid gap-5 p-6 md:grid-cols-3 sm:p-7">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-2xl">🌅</span>

                        <div>
                          <h4 className="font-semibold">Morning</h4>
                          <p className="text-xs text-white/40">
                            Start the day
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-7 text-white/65">
                        {day.morning}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-2xl">☀️</span>

                        <div>
                          <h4 className="font-semibold">Afternoon</h4>
                          <p className="text-xs text-white/40">
                            Explore & experience
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-7 text-white/65">
                        {day.afternoon}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-2xl">🌙</span>

                        <div>
                          <h4 className="font-semibold">Evening</h4>
                          <p className="text-xs text-white/40">
                            End the day
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-7 text-white/65">
                        {day.evening}
                      </p>
                    </div>
                  </div>

                  {/* FOOD / TIPS */}
                  <div className="grid gap-5 border-t border-white/10 p-6 md:grid-cols-2 sm:p-7">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-2xl">🍜</span>

                        <h4 className="font-semibold">
                          Food to try
                        </h4>
                      </div>

                      <ul className="space-y-2">
                        {day.food.map((item, index) => (
                          <li
                            key={index}
                            className="flex gap-2 text-sm text-white/65"
                          >
                            <span className="text-white/30">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-2xl">💡</span>

                        <h4 className="font-semibold">
                          Day tips
                        </h4>
                      </div>

                      <ul className="space-y-2">
                        {day.tips.map((item, index) => (
                          <li
                            key={index}
                            className="flex gap-2 text-sm text-white/65"
                          >
                            <span className="text-white/30">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* GENERAL TRAVEL TIPS */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
                  🎒
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    Travel tips
                  </h3>

                  <p className="text-sm text-white/40">
                    Helpful things to keep in mind
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {planResponse.itinerary.travel_tips.map(
                  (tip, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm leading-6 text-white/65"
                    >
                      {tip}
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}