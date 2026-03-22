import { X } from "lucide-react";
import { useAppStore } from "../store";
import { Button } from "./ui/button";

const comparisons = [
  {
    category: "Location Tracking",
    google:
      'GPS coordinates logged every ~2 minutes via Location History. Even with it "off", Web & App Activity still saves location.',
    ghost:
      "Zero location storage. Venice AI has zero data retention. We never know where you are.",
    icon: "\u{1F4CD}",
  },
  {
    category: "Search History",
    google:
      "Every Maps search query saved to Web & App Activity (ON by default). Includes businesses, addresses, categories.",
    ghost:
      "Venice AI = zero data retention. Searches are processed and immediately forgotten.",
    icon: "\u{1F50D}",
  },
  {
    category: "Navigation Routes",
    google:
      "Real-time speed, routes taken, start/end points, stops, mode of transport. Every user is an unwitting traffic sensor.",
    ghost:
      "TomTom calculates the route. We send anonymous coordinates only — zero user identity. Nothing stored.",
    icon: "\u{1F697}",
  },
  {
    category: "Business Interactions",
    google:
      "Every view, website click, phone call tap, direction request, photo view tracked and shared with business owners.",
    ghost:
      "No interaction tracking whatsoever. Your browsing habits are yours alone.",
    icon: "\u{1F3EA}",
  },
  {
    category: "Review Identity",
    google:
      "Reviews tied to real Google account. Review history builds a public profile of places visited.",
    ghost:
      "Pseudonymous. Reviews tied to wallet address only. No name, no email, no profile.",
    icon: "\u{1F464}",
  },
  {
    category: "Cross-App Profiling",
    google:
      "Data shared across Search, YouTube, Chrome, Photos, Gmail. Maps data feeds ad profiles across entire Google ecosystem.",
    ghost: "No other services. No ad network. No cross-app anything.",
    icon: "\u{1F578}",
  },
  {
    category: "Law Enforcement",
    google:
      "11,500+ geofence warrants in 2020 alone. Innocent people swept up for being near crime scenes.",
    ghost:
      "Nothing to hand over. Data never exists. Can't comply with what we don't have.",
    icon: "\u{1F46E}",
  },
  {
    category: "Opt-Out Reality",
    google:
      "Tracked 98 million users via third-party apps for 8 years AFTER they opted out. $425M verdict.",
    ghost: "No opt-out needed. Data is never collected in the first place.",
    icon: "\u{1F6AB}",
  },
];

const fines = [
  {
    case: "40-state AG settlement (2022)",
    amount: "$392M",
    detail: "Dark patterns, false claims location tracking was off",
    source: "https://www.npr.org/2022/11/14/1136521305/google-settlement-location-tracking-data-privacy",
  },
  {
    case: "Texas settlement (2024)",
    amount: "$1.375B",
    detail: "Tracked geolocation + biometrics without consent",
    source: "https://www.texasattorneygeneral.gov/news/releases/attorney-general-ken-paxton-finalizes-historic-settlement-google-and-secures-1375-billion-big-tech",
  },
  {
    case: "Jury verdict (2025)",
    amount: "$425.7M",
    detail: "Tracked 98M users via third-party apps for 8 years after opt-out",
    source: "https://www.cnbc.com/2025/09/04/google-must-pay-425-million-in-class-action-over-privacy-jury-rules.html",
  },
  {
    case: "Incognito mode settlement (2023)",
    amount: "$5B",
    detail: "Secretly collected browsing data in Incognito mode",
    source: "https://www.npr.org/2023/12/30/1222268415/google-settles-5-billion-privacy-lawsuit",
  },
];

export default function PrivacyPage() {
  const showPrivacy = useAppStore((s) => s.showPrivacy);
  const setShowPrivacy = useAppStore((s) => s.setShowPrivacy);

  if (!showPrivacy) return null;

  return (
    <div
      className="absolute inset-0 z-30 bg-void/80 backdrop-blur-sm overflow-y-auto flex justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowPrivacy(false);
      }}
    >
      <div className="bg-surface border border-edge rounded-2xl w-full max-w-[640px] p-6 shadow-panel self-start animate-decloak">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-extrabold font-display text-bone leading-tight">
            Your Maps App is Watching You
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-blue-gray hover:text-bone"
            onClick={() => setShowPrivacy(false)}
          >
            <X className="size-6" />
          </Button>
        </div>

        <p className="text-[15px] text-blue-gray leading-relaxed mb-5">
          Google Maps tracks your location constantly, saves every search,
          and has paid
          <strong className="text-coral"> $7.1B+ in privacy fines</strong>.
          Here's what they collect vs. what we don't.
        </p>

        {/* Comparison cards */}
        <div className="flex flex-col gap-3 mb-6">
          {comparisons.map((item) => (
            <div
              key={item.category}
              className="border border-edge rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-raised border-b border-edge">
                <span className="text-lg">{item.icon}</span>
                <h3 className="text-sm font-bold text-bone">{item.category}</h3>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-3.5 bg-coral/5 border-r border-edge">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-coral mb-1">
                    Google Maps
                  </div>
                  <p className="text-xs text-blue-gray leading-snug">
                    {item.google}
                  </p>
                </div>
                <div className="p-3.5 bg-phosphor/5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-phosphor mb-1">
                    Ghost Maps
                  </div>
                  <p className="text-xs text-blue-gray leading-snug">
                    {item.ghost}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fines section */}
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-coral mb-3 font-display">
            $7.1B+ in Privacy Fines
          </h2>
          <div className="flex flex-col gap-2">
            {fines.map((f) => (
              <div
                key={f.case}
                className="flex items-start gap-3 p-2.5 bg-coral/5 rounded-lg border border-coral/10"
              >
                <span className="text-base font-extrabold text-coral whitespace-nowrap min-w-[80px] font-mono">
                  {f.amount}
                </span>
                <div className="flex flex-col gap-0.5 text-xs text-blue-gray leading-snug">
                  <a
                    href={f.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bone text-sm font-bold hover:text-cyan no-underline"
                  >
                    {f.case} ↗
                  </a>
                  <span>{f.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency note */}
        <div className="bg-surface-raised rounded-xl p-4 mb-5 border-l-2 border-l-cyan">
          <h3 className="text-[15px] font-bold text-bone mb-2 font-display">
            Our Transparency
          </h3>
          <p className="text-sm text-blue-gray leading-relaxed mb-2">
            <strong className="text-bone">TomTom</strong> sees anonymous origin
            + destination coordinates for route calculation. No user identity
            sent.
          </p>
          <p className="text-sm text-blue-gray leading-relaxed mb-2">
            <strong className="text-bone">Google Places</strong> is used for
            business details (hours, photos). Google sees place name +
            coordinates — not who searched, what they searched for, or the
            user's location. Long-term, we'll replace this with community data.
          </p>
          <p className="text-sm text-blue-gray leading-relaxed">
            <strong className="text-bone">On-chain reviews</strong> are public
            on Base but tied only to a pseudonymous wallet address — no name,
            email, or account.
          </p>
        </div>

        <div className="text-center">
          <p className="text-base font-bold text-bone mb-3 font-display">
            Privacy by architecture, not by policy.
          </p>
          <Button
            className="font-display"
            onClick={() => setShowPrivacy(false)}
          >
            Back to Map
          </Button>
        </div>
      </div>
    </div>
  );
}
