import { useAppStore } from "../store";

const comparisons = [
  {
    category: "Location Tracking",
    google:
      'GPS coordinates logged every ~2 minutes via Location History. Even with it "off", Web & App Activity still saves location.',
    ghost:
      "Zero location storage. Venice AI has zero data retention. We never know where you are.",
    icon: "\u{1F4CD}", // 📍
  },
  {
    category: "Search History",
    google:
      "Every Maps search query saved to Web & App Activity (ON by default). Includes businesses, addresses, categories.",
    ghost:
      "Venice AI = zero data retention. Searches are processed and immediately forgotten.",
    icon: "\u{1F50D}", // 🔍
  },
  {
    category: "Navigation Routes",
    google:
      "Real-time speed, routes taken, start/end points, stops, mode of transport. Every user is an unwitting traffic sensor.",
    ghost:
      "TomTom calculates the route. We send anonymous coordinates only — zero user identity. Nothing stored.",
    icon: "\u{1F697}", // 🚗
  },
  {
    category: "Business Interactions",
    google:
      "Every view, website click, phone call tap, direction request, photo view tracked and shared with business owners.",
    ghost:
      "No interaction tracking whatsoever. Your browsing habits are yours alone.",
    icon: "\u{1F3EA}", // 🏪
  },
  {
    category: "Review Identity",
    google:
      "Reviews tied to real Google account. Review history builds a public profile of places visited.",
    ghost:
      "Pseudonymous. Reviews tied to wallet address only. No name, no email, no profile.",
    icon: "\u{1F464}", // 👤
  },
  {
    category: "Cross-App Profiling",
    google:
      "Data shared across Search, YouTube, Chrome, Photos, Gmail. Maps data feeds ad profiles across entire Google ecosystem.",
    ghost: "No other services. No ad network. No cross-app anything.",
    icon: "\u{1F578}", // 🕸
  },
  {
    category: "Law Enforcement",
    google:
      "11,500+ geofence warrants in 2020 alone. Innocent people swept up for being near crime scenes.",
    ghost:
      "Nothing to hand over. Data never exists. Can't comply with what we don't have.",
    icon: "\u{1F46E}", // 👮
  },
  {
    category: "Opt-Out Reality",
    google:
      "Tracked 98 million users via third-party apps for 8 years AFTER they opted out. $425M verdict.",
    ghost: "No opt-out needed. Data is never collected in the first place.",
    icon: "\u{1F6AB}", // 🚫
  },
];

const fines = [
  {
    case: "40-state AG settlement (2022)",
    amount: "$392M",
    detail: "Dark patterns, false claims location tracking was off",
  },
  {
    case: "Texas settlement (2024)",
    amount: "$1.375B",
    detail: "Tracked geolocation + biometrics without consent",
  },
  {
    case: "Jury verdict (2025)",
    amount: "$425.7M",
    detail: "Tracked 98M users via third-party apps for 8 years after opt-out",
  },
  {
    case: "Incognito mode settlement (2023)",
    amount: "$5B",
    detail: "Secretly collected browsing data in Incognito mode",
  },
];

export default function PrivacyPage() {
  const showPrivacy = useAppStore((s) => s.showPrivacy);
  const setShowPrivacy = useAppStore((s) => s.setShowPrivacy);

  if (!showPrivacy) return null;

  return (
    <div
      className="privacy-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowPrivacy(false);
      }}
    >
      <div className="privacy-page">
        <div className="privacy-header">
          <h1>Your Maps App is Watching You</h1>
          <button
            className="privacy-close"
            onClick={() => setShowPrivacy(false)}
          >
            &times;
          </button>
        </div>

        <p className="privacy-subtitle">
          Google Maps tracks your location every 2 minutes, saves every search,
          and has paid
          <strong> $7.3B+ in privacy fines</strong>. Here's what they collect
          vs. what we don't.
        </p>

        {/* Comparison cards */}
        <div className="privacy-comparisons">
          {comparisons.map((item) => (
            <div key={item.category} className="privacy-card">
              <div className="privacy-card-header">
                <span className="privacy-card-icon">{item.icon}</span>
                <h3>{item.category}</h3>
              </div>
              <div className="privacy-card-sides">
                <div className="privacy-side google">
                  <div className="privacy-side-label">Google Maps</div>
                  <p>{item.google}</p>
                </div>
                <div className="privacy-side ghost">
                  <div className="privacy-side-label">Ghost Maps</div>
                  <p>{item.ghost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fines section */}
        <div className="privacy-fines">
          <h2>$7.3B+ in Privacy Fines</h2>
          <div className="fines-list">
            {fines.map((f) => (
              <div key={f.case} className="fine-item">
                <span className="fine-amount">{f.amount}</span>
                <div className="fine-detail">
                  <strong>{f.case}</strong>
                  <span>{f.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency note */}
        <div className="privacy-transparency">
          <h3>Our Transparency</h3>
          <p>
            <strong>TomTom</strong> sees anonymous origin + destination
            coordinates for route calculation. No user identity sent.
          </p>
          <p>
            <strong>Google Places</strong> is used for business details (hours,
            photos). Google sees place name + coordinates — not who searched,
            what they searched for, or the user's location. Long-term, we'll
            replace this with community data.
          </p>
          <p>
            <strong>On-chain reviews</strong> are public on Base but tied only
            to a pseudonymous wallet address — no name, email, or account.
          </p>
        </div>

        <div className="privacy-footer">
          <p>Privacy by architecture, not by policy.</p>
          <button
            className="privacy-back-btn"
            onClick={() => setShowPrivacy(false)}
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
}
