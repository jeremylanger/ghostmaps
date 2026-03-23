# Conversation: ghostmaps (4f032b42)

## Human

how long should the demo video be?

---

## Assistant

Let me check the hackathon strategy docs for demo video requirements.

---

## Assistant

`[Tool: Grep → demo|video|submission|recording]`

---

## Assistant

Based on the hackathon docs, there's no strict length requirement specified by the hackathon. Here's what your plans say:

- **`plans/judging/round-1.md:252`** — Lists "Record demo video" as a 5-10 min task (that's recording time, not video length)
- **`plans/build-plan.md:509`** — Says "Record demo video if required" (still TBD whether it's mandatory)

The submission draft (`plans/submission-draft.md`) has a placeholder for a Video URL but no length constraint.

For hackathon demo videos, **2-3 minutes** is the sweet spot — long enough to show the full flow (search → place panel → leave review → on-chain attestation → Guardian agent) but short enough that AI agent judges and humans will actually watch the whole thing. I'd recommend:

1. **~30s** — Problem/privacy pitch
2. **~60s** — Core flow (search, explore, review submission)
3. **~30-60s** — On-chain proof + Guardian agent behavior
4. **~15s** — Architecture/tech stack flash

Do you want me to check the Synthesis hackathon site for any official requirements on video length?

---

## Human

ok man yeah it's taking me like 1-2 mins talking about the problem and why we've built what we have. I need to figure out a way to trim it down. but it really does take time to show how other maps track you and we don't, and we're using private AI, and the importance of on chain reviews and why google maps and yelp have run into their own issues with this

---

## Assistant

The problem is you're explaining three separate theses (tracking, private AI, review fraud) sequentially. Judges — especially AI agents — don't need to be convinced of the problem. They need to see the solution.

**Try this: show, don't tell.** Instead of explaining why Google tracks you, do a 15-second side-by-side — open Google Maps, show the privacy dashboard/data collection, then open Ghost Maps and show the contrast. Visual proof hits harder than narration.

Practical structure:

- **15s** — "Google Maps tracks every search, every route, every location. Yelp reviews are 25% fake. Ghost Maps fixes both." That's the entire problem statement.
- **10s** — Flash the privacy comparison page you already built (it does the explaining for you)
- **Rest of the video** — Live demo of the actual product

The privacy page and the on-chain attestation explorer ARE your arguments. Let the product make the case. Every second you spend talking about the problem is a second judges don't see what you built — and what you built is strong.

---

## Human

why exactly do we need private AI in ghost maps?? I want this to land home with Venice. couldn't any other AI integration be done and have it go through our servers to be anonymous? I guess it wouldn't really be that anonymous, because it's all tied to OUR api key. so AI can see how Ghost Maps users use the software.

---

## Assistant

Right, you just answered your own question. There are two levels:

1. **Proxying through your server** — Hides the user from OpenAI/Google, but now *you* become the surveillance layer. Every search is tied to your API key, your logs, your server. You'd have to promise not to log, and users would have to trust that promise. You've just moved the problem, not solved it.

2. **Venice** — Zero data retention is *their* infrastructure guarantee, not just a policy promise. The AI provider itself can't see what individual users searched for because they don't store it. Your API key gets billed but the query content isn't retained or tied back to individual sessions.

So the argument for the demo is simple: **"We don't just hide your searches from Google — we use an AI provider that can't remember them either. Not because of a privacy policy, but because the infrastructure doesn't retain them. There's no database of your searches sitting on anyone's server — not ours, not the AI's."**

That's the difference between privacy-by-policy (pinky promise) and privacy-by-architecture (can't even if they wanted to). That's what makes the Venice integration genuine rather than cosmetic.

---

