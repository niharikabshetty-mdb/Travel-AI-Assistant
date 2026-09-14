"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<"traveller" | "admin">("traveller");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }

        if (password.length < 6) {
          throw new Error("Password must contain at least 6 characters.");
        }

        await createUserWithEmailAndPassword(auth, email, password);

        // For now, every newly created account goes to the traveller home.
        // Admin authorization will be handled properly later.
        router.push("/home");
      } else {
        await signInWithEmailAndPassword(auth, email, password);

        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/home");
        }
      }
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";

      if (err instanceof Error) {
        message = err.message;
      }

      // Convert Firebase's technical errors into beginner-friendly messages.
      if (message.includes("auth/invalid-credential")) {
        message = "Incorrect email or password.";
      } else if (message.includes("auth/user-not-found")) {
        message = "No account exists with this email.";
      } else if (message.includes("auth/wrong-password")) {
        message = "Incorrect password.";
      } else if (message.includes("auth/email-already-in-use")) {
        message = "An account with this email already exists.";
      } else if (message.includes("auth/invalid-email")) {
        message = "Please enter a valid email address.";
      } else if (message.includes("auth/weak-password")) {
        message = "Password must contain at least 6 characters.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background" />

      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-mark">✦</div>
          <span>JourneyBuddy</span>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <span className="eyebrow">
              {isSignup ? "Start your journey" : "Welcome back"}
            </span>

            <h1>
              {isSignup
                ? "Create your account."
                : "Your next adventure awaits."}
            </h1>

            <p>
              {isSignup
                ? "Create your JourneyBuddy account and start planning unforgettable trips."
                : "Sign in to continue planning your perfect journeys."}
            </p>
          </div>

          <div className="auth-switch">
            <button
              type="button"
              className={!isSignup ? "active" : ""}
              onClick={() => {
                setIsSignup(false);
                setError("");
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              className={isSignup ? "active" : ""}
              onClick={() => {
                setIsSignup(true);
                setError("");
              }}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <div className="form-field">
                <label htmlFor="name">Full name</label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {!isSignup && (
              <div className="role-selector">
                <span>Continue as</span>

                <div className="role-options">
                  <button
                    type="button"
                    className={role === "traveller" ? "selected" : ""}
                    onClick={() => setRole("traveller")}
                  >
                    ✈ Traveller
                  </button>

                  <button
                    type="button"
                    className={role === "admin" ? "selected" : ""}
                    onClick={() => setRole("admin")}
                  >
                    ⚙ Admin
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create my account →"
                : "Sign in →"}
            </button>
          </form>

          <div className="auth-footer">
            <button
              type="button"
              onClick={() => router.push("/")}
            >
              ← Back to JourneyBuddy
            </button>
          </div>
        </div>

        <p className="auth-note">
          Your journey. Your plans. Your adventure.
        </p>
      </div>
    </main>
  );
}