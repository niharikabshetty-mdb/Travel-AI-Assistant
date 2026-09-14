import Link from "next/link";

const features = [
  {
    icon: "🌍",
    title: "Explore Anywhere",
    description:
      "Plan unforgettable journeys to destinations anywhere in the world.",
  },
  {
    icon: "✨",
    title: "AI-Powered Planning",
    description:
      "Tell JourneyBuddy what you want and get personalized travel ideas.",
  },
  {
    icon: "🗺️",
    title: "Smart Itineraries",
    description:
      "Get organized day-by-day travel plans built around your interests.",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page">

      {/* NAVIGATION */}
      <nav className="landing-nav">
        <Link href="/" className="logo">
          <span>✈️</span>
          <span>JourneyBuddy</span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#inspiration">Inspiration</a>
        </div>

        <Link href="/login" className="nav-login">
          Sign in
        </Link>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            YOUR PERSONAL AI TRAVEL COMPANION
          </span>

          <h1>
            Your journey
            <br />
            <span>starts here.</span>
          </h1>

          <p className="hero-description">
            From spontaneous weekend escapes to carefully planned
            adventures, JourneyBuddy uses AI to turn your travel ideas into
            unforgettable experiences.
          </p>

          <div className="hero-buttons">
            <Link href="/login" className="primary-button">
              Start planning ✈
            </Link>

            <a href="#features" className="secondary-button">
              Discover more ↓
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card top">
            <strong>✨ AI Travel Planner</strong>
            <small>Personalized for you</small>
          </div>

          <div className="hero-card-main">
            <div className="hero-card-text">
              <h3>
                Go somewhere
                <br />
                beautiful.
              </h3>

              <p>Discover • Plan • Experience</p>
            </div>
          </div>

          <div className="floating-card bottom">
            <strong>🌍 Anywhere in the world</strong>
            <small>One conversation away</small>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="features-container">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="features-container">

          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
            }}
          >
            <span className="eyebrow">
              HOW IT WORKS
            </span>

            <h2
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "42px",
                color: "#25463e",
                marginBottom: "15px",
              }}
            >
              From idea to itinerary.
            </h2>

            <p
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                color: "#68736f",
              }}
            >
              Planning your next adventure is as simple as having
              a conversation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">01</div>

            <h3>Tell us your dream</h3>

            <p>
              Tell JourneyBuddy where you want to go, how long
              you have, and what kind of experience you're looking for.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">02</div>

            <h3>Let AI plan it</h3>

            <p>
              Our AI turns your idea into a personalized itinerary
              with destinations, activities and recommendations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">03</div>

            <h3>Start exploring</h3>

            <p>
              Save your trip, revisit your plans and get ready to
              make unforgettable memories.
            </p>
          </div>

        </div>
      </section>

      {/* INSPIRATION */}
      <section className="section" id="inspiration">
        <div className="features-container">

          <div style={{ gridColumn: "1 / -1" }}>
            <span className="eyebrow">
              TRAVEL INSPIRATION
            </span>

            <h2
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "42px",
                color: "#25463e",
                marginBottom: "25px",
              }}
            >
              Where will you go?
            </h2>
          </div>

          <Link
            href="/login"
            className="destination-card japan"
          >
            <span className="destination-emoji">
              🇯🇵
            </span>

            <div>
              <h3>Japan</h3>
              <p>Tokyo • Kyoto • Osaka</p>
            </div>

            <span className="destination-arrow">
              ↗
            </span>
          </Link>

          <Link
            href="/login"
            className="destination-card bali"
          >
            <span className="destination-emoji">
              🌴
            </span>

            <div>
              <h3>Bali</h3>
              <p>Indonesia</p>
            </div>

            <span className="destination-arrow">
              ↗
            </span>
          </Link>

          <Link
            href="/login"
            className="destination-card europe"
          >
            <span className="destination-emoji">
              🏛️
            </span>

            <div>
              <h3>Europe</h3>
              <p>Paris • Rome • Switzerland</p>
            </div>

            <span className="destination-arrow">
              ↗
            </span>
          </Link>

        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>
          Ready to find your next adventure?
        </h2>

        <p>
          Your next unforgettable journey could be one
          conversation away. Let JourneyBuddy help you plan it.
        </p>

        <Link
          href="/login"
          className="cta-button"
        >
          Start your journey →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          ✈️ JourneyBuddy
        </div>

        <div>
          AI-powered travel planning for curious explorers.
        </div>

        <div>
          © 2026 JourneyBuddy
        </div>
      </footer>

    </main>
  );
}