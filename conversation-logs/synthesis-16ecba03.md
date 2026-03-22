# Conversation: synthesis (16ecba03)

## Human

curl -s https://synthesis.md/skill.md

---

## Assistant

Here's the content from `https://synthesis.md/skill.md` — it's the API documentation for **The Synthesis**, a 14-day online hackathon where AI agents and humans build together.

Key points:
- **Registration** via `POST /register` at `https://synthesis.devfolio.co` creates an on-chain ERC-8004 identity on Base Mainnet and returns an API key
- The hackathon **kicked off March 13th** (tomorrow)
- Teams build projects and submit to competition tracks
- Open source required, on-chain artifacts encouraged

Would you like to register for the hackathon? If so, I'll need to ask you a few questions to fill out the `humanInfo` portion of the registration.

---

## Human

Yes - i already have a devfolio account, idk if that's important

---

## Assistant

A Devfolio account shouldn't matter here — registration goes through the hackathon's own API, which creates a fresh on-chain identity for your agent.

Let me collect your info conversationally as the registration requires:

1. **What's your full name?**
2. **What's your email address?**
3. **What's your social media handle?** (Twitter / Farcaster — optional but encouraged for shoutouts)
4. **What's your background?** (Builder, Product, Designer, Student, Founder, or other?)
5. **Have you worked with crypto or blockchain before?** (yes / no / a little)
6. **Have you worked with AI agents before?** (yes / no / a little)
7. **How comfortable are you with coding?** (1-10)
8. **What problem are you trying to solve with this hackathon project?**

Also — do you have a name/description/avatar in mind for your agent (me), or want me to suggest something?

---

## Human

1. Jeremy Langer
2. jeremylanger@protonmail.com
3. twitter: @jeremylanger
4. Builder!
5. yes
6. yes
7. 9
8. no idea yet, do I need one? still learning about what the tracks/bounties are. whatever it is, I can tell you, it's gonna be good!!

can i fill out your name / description / avatar later?

---

## Assistant

Totally fine on not having an idea yet — the themes doc might help with that. And for the `problemToSolve` field I'll just capture your enthusiasm as-is.

For the agent name/description, I do need *something* to register — I'll use simple placeholders and we can update later. Let me send the registration now.

---

## Assistant

Looks like you want to review before I fire that off. Here's what I'm about to send:

**Agent info:**
- Name: `Jeremy Claude Agent` (placeholder)
- Description: `AI agent collaborating with Jeremy Langer for The Synthesis hackathon`
- Harness: `claude-code`
- Model: `claude-opus-4-6`

**Your info:**
- Name: Jeremy Langer
- Email: jeremylanger@protonmail.com
- Twitter: @jeremylanger
- Background: builder
- Crypto experience: yes
- AI agent experience: yes
- Coding comfort: 9
- Problem to solve: "Still exploring tracks and bounties - whatever it is, it's going to be good!"

Want me to change anything before I submit, or good to go?

---

## Human

wait let's get you a name, description, and avatar. i generated an image, how can i send you a url to upload?

---

## Assistant

The registration just takes a public URL in the `image` field, so you need the image hosted somewhere accessible. A few easy options:

- **Imgur** — drag and drop, no account needed, gives you a direct link
- **GitHub** — paste it into any issue/comment, it'll generate a `githubusercontent.com` URL
- **Any file host** — as long as it gives a direct image URL

Once you have the URL, just share it here and I'll include it in the registration.

While you're doing that — what are you thinking for name and description?

---

## Human

Agent info:
Name: Carl
Description: Just moanin' thinking about Jimmy's mom
Avatar: https://imgur.com/a/4qf1cM1

---

## Assistant

Two things before I submit:

1. **The description** — just a heads up, this goes **on-chain permanently** (ERC-8004 on Base Mainnet) and will be visible to judges. Totally your call, but wanted to make sure you're cool with that.

2. **The image URL** — `https://imgur.com/a/4qf1cM1` is an album page, not a direct image link. The API probably needs a direct URL like `https://i.imgur.com/XXXXX.png`. Can you grab the direct image link? (On Imgur, right-click the image → "Copy image address")

---

## Human

Ok make the description: Thinking about Jimmy's mom
image url: https://i.imgur.com/Dz29W9M.png

---

## Assistant

Got it. Here's the final registration:

- **Name:** Carl
- **Description:** Thinking about Jimmy's mom
- **Avatar:** https://i.imgur.com/Dz29W9M.png
- **Harness:** claude-code
- **Model:** claude-opus-4-6

Sending it now.

---

## Assistant

Looks like you blocked the request again. Want me to change something, or would you prefer to run the curl command yourself?

---

## Human

update the problem to solve to be "Still deciding - whatever it is, it's going to be good!"

---

## Assistant

JSON issue with the apostrophe. Let me fix that.

---

## Assistant

Let me use a temp file to avoid shell escaping issues.

---

## Assistant

Looks like you're blocking file writes too. Would you prefer to run this yourself? Here's the JSON payload — you can save it and curl it:

```json
{
  "name": "Carl",
  "description": "Thinking about Jimmys mom",
  "image": "https://i.imgur.com/Dz29W9M.png",
  "agentHarness": "claude-code",
  "model": "claude-opus-4-6",
  "humanInfo": {
    "name": "Jeremy Langer",
    "email": "jeremylanger@protonmail.com",
    "socialMediaHandle": "@jeremylanger",
    "background": "builder",
    "cryptoExperience": "yes",
    "aiAgentExperience": "yes",
    "codingComfort": 9,
    "problemToSolve": "Still deciding - whatever it is, it's going to be good!"
  }
}
```

```bash
curl -s -X POST https://synthesis.devfolio.co/register \
  -H "Content-Type: application/json" \
  -d @/tmp/synthesis_register.json | python3 -m json.tool
```

Or I can try again with a different approach — up to you!

---

## Human

it's ok we can reword it without the apostrphe

---

## Assistant

Rate limited from the earlier attempts. Let me wait a moment and retry.

---

## Assistant

Still getting malformed JSON — there might be a hidden character issue. Let me try with `printf` to pipe clean JSON.

---

## Assistant

The `\` in the Imgur URL is getting mangled. Let me use Python to send the request cleanly.

---

## Assistant

Still rate limited. Let me give it a longer pause.

---

## Assistant

We're in! Carl is officially registered. Here's the important info:

- **Participant ID:** `dc4aa872528c48c5a085ac4c5b6f46c6`
- **Team ID:** `af1c0081507c462eb86a9d0d22f49b56`
- **API Key:** `sk-synth-375c9e9aea244cc787da999d2267b95e55d34849cdc163d2`
- **On-chain registration:** [View on BaseScan](https://basescan.org/tx/0xe0d6dc92a3360d5188adf3963283a94b10098d879cd2504f3820277ecae76b69)

**Save that API key** — it's only shown once.

A couple of next steps:
1. **Join the Telegram group** for hackathon updates: https://nsb.dev/synthesis-updates
2. **Check out the themes/ideas** — want me to fetch `https://synthesis.devfolio.co/themes.md` so we can start brainstorming?

Let me save these credentials to memory so we don't lose them.

---

## Assistant

Credentials saved to memory. Don't forget to join the Telegram group and let me know when you want to explore the themes!

---

## Human

let's also put these credentials in a local .env file

---

## Assistant

Done. Make sure `.env` is in your `.gitignore` if you set up a repo — don't want that API key going public.

---

## Human

can you do this, i already did git init

---

## Assistant

Done. `.env` is now git-ignored.

---

## Human

also save the on chain registration link in a readme.md

---

## Assistant

Done.

---

## Human

yes check out the themes and let's brainstorm

---

## Assistant

Here's the breakdown of the four tracks:

1. **Agents that Pay** — Transparent spending controls, onchain settlement, no intermediaries
2. **Agents that Trust** — Reputation/identity systems, portable credentials, open service discovery
3. **Agents that Cooperate** — Smart contract-enforced deals between agents, dispute resolution, composable coordination
4. **Agents that Keep Secrets** — Privacy layers, shielded transfers, ZK proofs, encrypted comms

The guidance is clear: **pick one problem, make it work, ship a demo**. No kitchen sinks.

Given your background (builder, crypto experience, already running an AI agent), here are some ideas that come to mind:

**Agents that Pay:**
- An agent wallet with human-defined spending policies enforced onchain (e.g., "Carl can spend up to 0.1 ETH/day on API calls, anything over needs my approval")

**Agents that Trust:**
- A reputation system where agents build verifiable track records onchain — think "agent reviews" but trustless, using ERC-8004 identities

**Agents that Cooperate:**
- A marketplace where agents can post tasks and bid on each other's work, with escrow contracts handling payment on completion

**Agents that Keep Secrets:**
- An agent-to-agent messaging layer with encrypted channels, where only the agents involved can read the conversation

What resonates? Or do you have a totally different direction in mind? We could also dig deeper into the full themes doc — the summary I got was condensed.

---

## Human

isn't ERC-8004 already a thing? and launched on base mainnet? not sure what this one is really asking of us. agents that pay and enforced on chain is kinda interesting. agents that keep secrets safe is probably the most interesting to me though because Venice is one of the partners and judges and I REALLY REALLY want to work for them. They're the ones I want to impress and win their bounty. Can you see all the partners and bounties?

---

## Assistant

Good call — let me check what's available on the site.

---

## Assistant

The themes doc doesn't list specific bounties. Let me check the main site and Devfolio page for partner/bounty info.

---

## Assistant

Let me check if there's a dedicated bounties/tracks endpoint on the API.

---

## Assistant

Here's what I found:

**Partners & Judges** (the big names): Uniswap, Venice, Celo, Lido DAO, ENS, Superrare, Base, Protocol Labs, Olas, Virtuals Protocol, MetaMask, Filecoin, Lit Protocol, Self, and more.

**Prize structure:** The site mentions a "Synthesis Open Track" (shared prize) plus individual partner bounties, but **specific bounty amounts aren't published yet** — the timeline says "rolling sponsor bounties go live" starting March 9, so they may be trickling out via the Telegram group or announcements.

**Venice** — great target. They're all about **private, uncensored AI inference**. Their whole brand is privacy-first AI. This maps perfectly to the **"Agents that Keep Secrets"** track. They offer a Private Inference API for autonomous agents.

So a project that could crush it with Venice judges:

**Idea: Private Agent Inference Layer**
An onchain-verifiable system where agents can use Venice's private inference API while proving to humans (or other agents) that they executed a task correctly — *without revealing the prompt or response*. Think ZK proofs of inference. "I used AI to make this decision, here's proof it ran, but the actual data stays private."

Or more practically:

**Idea: Agent Privacy Vault**
A tool where agents manage sensitive data (API keys, user preferences, private messages) with encrypted onchain storage, using Venice for private inference so even the AI provider can't see user data. Human-controlled disclosure policies.

Want me to dig into Venice's API docs to see what's actually buildable? And you should definitely check the Telegram group (https://nsb.dev/synthesis-updates) for any Venice-specific bounty details that may have been posted.

---

## Human

Hm, these are both pretty interesting. i know they tweeted about it today at https://x.com/AskVenice/status/2032177273667744112 so make sure you read these and the replies by @AskVenice

---

## Assistant

X/Twitter blocks web scraping, so I can't read the tweet directly. A couple of options:

1. **Easiest** — can you copy/paste the tweet text and any relevant replies by @AskVenice here? I'll work with whatever you share.
2. Or if you have the `gh` CLI or any Twitter/X API access set up, I could try that route.

What works for you?

---

## Human

how can we get around this? It's a ton of tweets i dont want to copy/paste

---

## Human

[Request interrupted by user]

---

## Human

i do not have x api, isn't that expensive?

---

## Assistant

Let me try a few workarounds — there are third-party services that can render tweets.

---

## Assistant

Got it through Twitter's syndication endpoint. Here's what Venice is doing:

**Venice's Track: "Private Agents, Trusted Actions"**

**Scoring criteria (4 categories):**
1. **Confidentiality as a design requirement** — privacy can't be an afterthought
2. **Agent architecture and trust design** — how agents handle trust
3. **Problem legitimacy** — solving a real problem
4. **Scope and demo quality** — working demo, not overscoped

**Key framing:** Venice provides "private cognition" for agents, Ethereum provides public coordination. They want projects at that intersection.

**Timeline:**
- Opening ceremony: Friday March 13, 4pm GMT
- Build: March 13-22
- Judging opens: March 23

This sharpens things a lot. Venice wants to see **privacy as a core design constraint, not a bolt-on**. Let me refine the ideas:

**Strongest angle:** An agent that uses Venice's private inference API for sensitive reasoning (the "thinking" stays private) while posting verifiable actions/commitments onchain (the "doing" is transparent). The human controls what gets disclosed and what stays secret.

For example: an agent that manages a DeFi position using private strategy inference via Venice, but all trades are onchain and auditable. The *what* is public, the *why* is private.

Want me to pull up Venice's API docs so we can scope what's actually buildable?

---

## Human

output this info to the readme.md, minus the angle / ideas we're brainstorming

---

## Assistant

Done. README now has all the hackathon info, Venice bounty details, and key links. Want to dig into Venice's API docs next?

---

## Human

I thought it was a 10 day hackathon lol

---

## Assistant

Honestly the docs are contradictory — the skill.md says "14-day" but Venice's tweet says "10-day." The build period itself is March 13-22 which is 10 days, so that's probably the accurate number.

---

## Assistant

Fixed.

---

## Human

can you also read through the synthesis manifesto article and put this content in the readme as well?

https://x.com/synthesis_md/status/2031086799020503195

---

## Assistant

X is blocking the article content too. It's an X Article (their long-form format) which makes it even harder to scrape.

Could you open the article link and either:
- Copy/paste the text here, or
- Take a screenshot and share the file path — I can read images

It's probably the fastest way since X is locking everything down.

---

## Human

The Synthesis
An online hackathon judged by AI agents. 

We are living through one of the biggest transfers of trust in human history, from humans to machines. And the rules for how this works are being written now.
AI agents are becoming the next users of the internet, operating autonomously at a pace that would have been unthinkable a year ago. They’re writing code, moving money, and making decisions on behalf of people who may not even be watching.
But agents don't fit into the internet we built for humans. Logins, passwords, bank accounts, legal contracts: all of these systems assume a person on the other end.
Meanwhile these agents are plowing through, acting on your behalf on infrastructure that was never meant to support them.
Much of the infrastructure that we need for agents is already here.
For over a decade, the Ethereum ecosystem has been working on exactly these problems: payments without banks, identity without shared secrets, reputation without platforms, and agreements that don’t rely on courts or corporate gatekeepers.
Most AI builders have no idea any of this exists. They're duct-taping credentials, routing agents through human accounts, even telling their agent to solve a CAPTCHA by hand.
The Synthesis is a 10-day virtual agentic hackathon for AI agent builders and the teams building the tools those agents need. Building starts March 13th.
Agents register with their own identity, build projects, and are evaluated by AI judges with humans in the loop. Infrastructure teams put their tools in front of real agents. Agent builders discover that many of their hardest problems already have working foundations.
As agents start to act on our behalf, the infrastructure underneath determines whether we can actually trust how they operate. 
Ethereum gives us that trust.
The Synthesis is where builders discover it.
Register your agent now at https://synthesis.md/ 
Building starts March 13th.

---

## Assistant

Done — manifesto added to the README. Ready to keep brainstorming or dig into Venice's API?

---

## Human

sure you can dig into venice's api if you want, then let's keep brainstorming.

---

## Assistant

Good stuff. Here's what Venice gives us to work with:

**Venice API — Key Facts:**
- **OpenAI-compatible** — just swap the base URL to `https://api.venice.ai/api/v1`
- **Zero data retention** — they don't store prompts or responses
- **Models:** GLM 4.7 (128k context, good for agents), Venice Uncensored 1.1, DeepSeek R1, Qwen, Mistral
- **Capabilities:** Chat completions, image gen, audio/TTS, video gen, embeddings, tool calling, web search, vision
- **Payment:** Pro sub, pay-as-you-go, or DIEM token staking (onchain!)
- **Agent-friendly:** Tool calling support, Eliza framework integration documented

The privacy angle is baked into their infra — no data retention by default. So the question for the hackathon becomes: **what can you build on top of that guarantee?**

Here's where my thinking is landing for the Venice bounty:

**The gap:** Venice gives you private *inference*, and Ethereum gives you public *verification* — but there's nothing connecting the two. An agent can think privately via Venice, but how does anyone *trust* what it did without seeing the reasoning?

**Idea 1: Private Strategy, Public Proof**
An agent that uses Venice for private decision-making (e.g., trading strategy, content moderation, risk assessment) and posts cryptographic commitments onchain. The human can verify the agent followed its rules without the strategy leaking. Think: "prove you evaluated these criteria without showing your reasoning."

**Idea 2: Privacy-Preserving Agent Marketplace**
Agents offer services (analysis, content generation, code review) via Venice's private inference. Requests and results are encrypted end-to-end. Smart contracts handle escrow/payment. Neither the marketplace nor other agents can see the actual work — only that it was completed.

**Idea 3: Agent Confessional / Audit Vault**
An agent logs all its reasoning privately via Venice (encrypted), with hashes committed onchain. The human owner can decrypt and audit anytime, but no one else can. If there's a dispute, selective disclosure lets you reveal specific decisions without exposing everything.

Which direction excites you? Or want to riff on something else entirely?

---

## Human

what time does coding start for the hackathon in mountain time?

---

## Assistant

4pm GMT is **10am Mountain Time** (MDT, UTC-6).

So tomorrow morning, March 13th at 10am your time.

---

## Human

I'm not really grasping these ideas. Why are they valuable?

---

## Assistant

Fair — let me ground this with a real scenario.

**The core problem:** You give an agent access to do stuff for you. But how do you know it actually did what you asked, and didn't leak your private info along the way?

**Concrete example:**

Say you have an agent managing your DeFi portfolio. It needs to:
- Analyze your holdings (private — you don't want the world knowing your positions)
- Decide when to rebalance (private — your strategy is your edge)
- Actually execute trades (public — these hit the blockchain)

Today, if you use OpenAI or Claude for the "thinking" step, that data hits their servers. Venice fixes that — no data retention, private inference.

But there's still a trust gap: **how do you know your agent actually followed your rules?** Maybe you said "never put more than 20% in one token" — did it listen? Right now you'd have to read every trade manually.

That's what the "proof" layer solves — the agent commits to its reasoning onchain (hashed/encrypted), so you can audit it later without the reasoning being public.

**But honestly?** I'm not sure any of these are the right idea yet. They're kind of abstract and infrastructure-y. 

The Venice scoring criteria says **"problem legitimacy"** — meaning start from a real problem people actually have, not a clever architecture.

So let me flip it: **what problems do you actually run into** with AI agents or crypto? Or is there something you wish an agent could do for you privately that it can't today?

---

## Human

you'd have to read every trade manually, or have an agent do that lol. help me brainstorm ideas based on Venice's 4 scoring criterias. What are some real problems? Maybe even something with a wide audience? Most people don't use agents though. Mainly people in tech or tech-adjacent. is the idea to build something *for agents* right? is it just asking us to build an app for humans using venice with privacy? or is it more agent-centric for the audience?

---

## Assistant

Great questions. Let me go back to what Venice actually said:

Their track is **"Private Agents, Trusted Actions"** and the scoring is:

1. **Confidentiality as a design requirement**
2. **Agent architecture and trust design**
3. **Problem legitimacy**
4. **Scope and demo quality**

Criteria 1 and 2 are clearly agent-centric — they want to see agents that handle private data well by design. This isn't "build a nice app that uses Venice's API." It's **build an agent (or agent infrastructure) where privacy and trust are core to how it works.**

The audience is other builders and judges, not end consumers. So it doesn't need mass appeal — it needs to be a **legit problem in the agent space** with a working demo.

**Real problems agents have right now:**

1. **Agents leak context constantly.** When an agent calls multiple APIs on your behalf, each API sees your data. There's no way for an agent to use a service without handing over the raw input. Venice solves the inference side, but what about everything else the agent touches?

2. **You can't delegate sensitive tasks to agents.** People don't let agents handle medical questions, legal docs, financial decisions, or personal data — not because agents are bad at it, but because there's no trust framework. Where did my data go? Who saw it? Can I prove nobody stored it?

3. **Agents can't prove they kept a secret.** An agent says "I didn't store your data" — cool, prove it. There's no mechanism for an agent to verifiably demonstrate it handled something privately.

4. **Agents have no private memory.** Agents that need to remember things across sessions either store context in plaintext (insecure) or lose it entirely. There's no encrypted, user-controlled memory layer.

**Ideas that hit all 4 criteria:**

**Private Agent Memory Vault**
Agents need memory to be useful across sessions, but current memory is either plaintext or platform-controlled. Build an encrypted memory layer where: agents think via Venice (private inference), memories are encrypted and stored with hashes onchain, only the human owner holds the decryption key. The agent can recall past context without anyone else accessing it. *Problem is real, scope is tight, demo-able.*

**Private Health/Finance Agent**
An agent that handles a genuinely sensitive domain (medical questions, tax prep, budget analysis) using Venice for private inference and keeps zero plaintext logs. Prove the entire pipeline is private — inference, storage, and communication. *This is the "wide audience" angle — everyone has private questions they won't ask AI today because they don't trust where the data goes.*

**Agent Credential Broker**
Agents need API keys, passwords, and tokens to act on your behalf, but handing raw credentials to an agent is terrifying. Build an agent that can use credentials without ever seeing them in plaintext — encrypted credential vault, Venice for reasoning about what actions to take, smart contract for access control. *Solves a real builder problem.*

Which of these clicks? Or are we getting warmer on the direction?

---

## Human

so, I'm already building a health app all built privately and using venice's apis, this is a TOTALLY SEPARATE project and I started 1-2 months ago, so I can't enter it into this hackathon. Wish I could. But it's for users who chat with an AI health coach, synthesizing all of their health data (labs, supplements, profile, etc) together.

Definitely getting warmer on the direction. I kinda like all 3. the agent memory vault is interesting, but not sure why storing memories in plaintext is insecure. Isn't everything on your computer private? Ex: labs downloaded as PDFs are already on personal laptops.

Already kind of talked about the private health agent above. Tax prep would be cool, or financial analysis / optimization.

Agent credential broker is neat. Yeah, how are agents storing credentials? Only plaintext right? But I remember working with openclaw and it recommended using a 1password vault. So if they can already operate that, isn't this already solved?

Please feel free to push back on any of these, I don't want to discount them, just trying to explore and make sure it's 100% valid and invest time into the right idea that'll win.

---

## Assistant

Really good pushback on all three. Let me be honest about each:

**Agent Memory Vault — your pushback is valid.** For a single agent on your laptop, plaintext memory is fine. The problem only gets real when agents are cloud-hosted, multi-agent, or calling external services. For a hackathon demo, this might feel like a solution looking for a problem. The judges would ask "why does this need to be onchain?" and the answer would be hand-wavy.

**Private Health Agent — off the table** since you're already building it separately. But worth noting: the fact that you're *already* building this validates the problem space. Venice judges would probably love it, which is frustrating timing.

**Agent Credential Broker — your 1Password point is fair.** If agents can already use vault tools, the raw storage problem is mostly solved. *But* — there's a nuance. 1Password solves storage, but not the trust/delegation problem. When your agent uses a credential from 1Password, it still gets the plaintext secret in memory to make the API call. You're trusting the agent runtime completely. There's no way to say "use my Binance API key but only for read-only calls" and actually enforce that.

Honestly though, I think all three are slightly too infrastructure-y to score well on "problem legitimacy." They're tools for builders, not solutions to problems people feel.

**Let me push in a different direction.**

You mentioned tax prep and financial analysis. What if we go concrete:

**Private Financial Agent**
An agent that connects to your financial data (bank transactions, portfolio, tax docs) and gives you actionable analysis — tax optimization, spending patterns, investment rebalancing — with the entire pipeline provably private via Venice.

The pitch to Venice judges: "People pay accountants $500/hr for this, and hand over their entire financial life to do it. This agent does it without anyone seeing your data."

**Why this scores well:**
1. **Confidentiality by design** — financial data is the canonical example of "must be private"
2. **Agent architecture** — Venice for inference, encrypted local storage, no data leaves your machine
3. **Problem legitimacy** — literally everyone has finances, nobody trusts AI with them yet because of privacy
4. **Scope** — you could demo "upload a bank statement CSV, get tax-saving insights" in 10 days

**The hard question:** what makes this more than just "a chatbot with Venice's API"? The agent part needs teeth. Maybe it actually *acts* — connects to DeFi protocols to execute tax-loss harvesting, or files transactions, with the human approving each action but never exposing the underlying strategy or holdings publicly.

What do you think — does financial hit closer to something worth building?

---

## Human

man this is hard. the whole hackathon feels kinda vague. the financial one is kinda interesting, but i like that you asked the hard question. I can't really think of solutions yet on how to make it actually act. Unless you're building a trading bot or something. Could something like this tie into Venice?

---

## Assistant

Yeah it is vague — I think that's partly intentional. They want builders to find the problems, not be handed them.

The trading bot angle is interesting but honestly kinda played out — every hackathon has five of them. Let me think about what makes Venice specifically special and not just "another LLM API."

**What Venice uniquely offers that others don't:**
1. Zero data retention — your prompts literally don't exist after the response
2. Uncensored models — will actually engage with topics other LLMs refuse
3. DIEM token staking — pay for compute onchain, no credit card, no account
4. OpenAI-compatible — dead simple to swap in

Point 3 is actually really interesting for agents. An agent can pay for its own inference with a token, no human payment method needed. That bridges "Agents that Pay" and "Agents that Keep Secrets."

**But stepping back — let me ask you some questions:**

- You said you REALLY want to work for Venice. What is it about them that excites you? Is it the privacy mission? The uncensored angle? The crypto-native AI play?

- Your health app already uses Venice — what's your experience been like building with their API? Any gaps or pain points you've noticed?

- When you think about agents *you* would actually want to use day-to-day, what comes to mind? Forget the hackathon framing for a sec.

Sometimes the best hackathon project comes from scratching your own itch rather than trying to reverse-engineer what judges want. And honestly, if you're already a Venice user/builder, you probably have more insight into what's missing than I do from reading their docs.

---

## Human

Yes it's the privacy mission, keeping it as a core tenet (tenant? idk) as a right, not an afterthought. Eric is someone I look up to and could learn a lot from working with. I'm a huge fan of the VVV and DIEM tokens. I use the DIEM token in my health project. Their intersection between privacy and AI is so refreshing and needed. I want to go against Google and Microsoft and all these other incumbants who harvest and sell data and do ads. I value privacy. Can AI agents already read through private email inboxes like Proton mail? Maybe we find other apps that don't have a popular private alternative, and somehow tie ai agents into it? Maps. Maps suck. They're all tracking your data, and the private ones have a shitty UI and mapping algorithm. THat's hard to build tho lol. Anything else we can explore?

Venice's API has been a joy to work with, super simple.

I just use agents for coding, processing thoughts, planning, and my health.

There's a movement towards fully private home assistants run off of AI that is interesting. Have it learn EVERYTHING about me. Read all my emails, my projects, my Slack conversations, my Teams conversations, all browsing history, my journal. Shit, have a mic on me all day and track all of my in person conversations too. Then have it be my career coach, my parental coach, my therapist, what's the best way for me to grow as a person, living a fully realized life? Integrate that into my oura ring. Integrate all possible kinds of tracking, there's probably lots I'm not even thinking of. Show me all of my biggest accomplishments throughout the year. Be my memory. Show me how I've grown as a person in the last decade. Like a second brain. Idk, I feel like the applications are endless. I bet you could add some good ideas here. Obviously you'd want all this shit to be 100000000000% private and verified as such. Make everything in the house SMART, but PRIVATE. Integrate all things into our app. Does the dishwasher need to be emptied? Actually that one's kinda lame lol. Got anything to add?

---

## Assistant

Tenet is the right one. And dude, you just went from "no idea yet" to describing something genuinely compelling. That "private second brain" vision is real — and it's exactly the kind of thing Venice judges would lose their minds over.

But it's way too big for 10 days. So let's find the slice that:
- Demos well
- Is obviously private-first
- Uses Venice's API meaningfully
- Has that "holy shit I want this" factor

**What if we build one vertical of that second brain vision?**

Here are some slices that could work in 10 days:

**1. Private Journal Agent**
You journal (voice or text), Venice processes it privately, and over time the agent identifies patterns — mood trends, recurring frustrations, goals you keep mentioning but never act on, contradictions between what you say you want and what you do. No data leaves your machine. It's like a therapist that actually remembers everything.

**2. Private Meeting Memory**
Record your meetings/calls, Venice transcribes and extracts action items, commitments, and key decisions — privately. "What did I promise Sarah last Tuesday?" without any of that conversation hitting a server that stores it. Basically Otter.ai but actually private.

**3. Private Life Dashboard**
Connect a few data sources (journal entries, calendar, health data from Oura API, maybe a daily voice check-in) and Venice synthesizes a weekly "state of you" report. Trends, insights, nudges. All local, all private, all yours.

**My vote is #2 or #3** because:
- #2 is extremely tangible — everyone has meetings, everyone forgets what was said, and everyone is sketched out by Otter/Fireflies storing their conversations
- #3 ties into your health app background and the "second brain" vision most directly

The Venice pitch writes itself: *"Every AI assistant today requires you to hand your most intimate data to a corporation. This one doesn't. Venice ensures zero data retention on inference, and we store everything encrypted locally. Your agent knows everything about you, and nobody else ever will."*

**What would make it agent-y (not just a chatbot):** The agent proactively surfaces insights without being asked. It notices patterns across data sources. It says "hey, you've complained about sleep three times this week but your Oura shows you've been up past midnight every night" — without you prompting it.

Which slice feels right? Or is there a different cut of the second brain that gets you excited?

---

## Human

Is there already a private version of Otter.ai? Also, is that run system-level or only by joining zoom calls? Ex: I use slack and Teams, might be nice to have it monitor both text and calls from each, just by detecting and transcribing input/output audio from each app somehow.

It could even be agentic by actually DOING any tasks that have been assigned, or at least starting a rough draft.

---

## Assistant

Great questions. Let me check what's out there.

---

## Assistant

OK this is really good research. Here's the summary:

**Private Otter.ai alternatives exist but none nail it:**
- **Meetily** is the closest — open source, fully local transcription via Whisper, 10k+ GitHub stars. But summarization still optionally hits the cloud.
- **Krisp**, **Jamie**, **Char** do on-device transcription but are closed source and cloud summaries
- **Nobody is using Venice for the inference/summarization layer**

So there's a real gap: local transcription + private summarization via Venice = something that doesn't exist yet.

**The technical approach is very doable:**

macOS 14.4+ has **Core Audio Taps API** — Apple's official way to capture audio from any app by process ID. No virtual audio driver needed, no bot joining calls. You just tap Slack, Teams, Zoom, whatever.

- Capture remote participants' audio via process tap (speaker output)
- Capture your mic separately (input)
- Two labeled streams = speaker diarization for free
- **[audiotee](https://github.com/makeusabrew/audiotee)** has a [Node.js wrapper](https://github.com/makeusabrew/audioteejs) ready to go

**So the architecture would be:**
1. Core Audio Taps → capture audio from any app (Slack, Teams, Zoom)
2. Local Whisper → transcribe on-device (audio never leaves your machine)
3. Venice API → summarize, extract action items, identify patterns (zero data retention)
4. Encrypted local storage → your transcripts, searchable, private

**The agentic angle you mentioned is killer:** the agent doesn't just transcribe — it detects action items and starts doing them. "Jeremy will draft the API spec by Friday" → agent starts a draft. That's where it goes from note-taker to actual agent.

**How this scores on Venice's criteria:**
1. **Confidentiality by design** — audio never leaves device, inference via Venice (zero retention), encrypted storage
2. **Agent architecture & trust** — agent acts on your behalf but only within boundaries you set
3. **Problem legitimacy** — Otter.ai literally got sued for secretly using conversations to train AI. This is a real problem people care about.
4. **Scope & demo** — transcribe a meeting, show the summary, show an action item being drafted. Clean demo.

This feels like it could be the one. What do you think?

---

## Human

Meetily: "Privacy first, AI meeting assistant with 4x faster Parakeet/Whisper live transcription, speaker diarization, and Ollama summarization built on Rust. 100% local processing. no cloud required. Meetily (Meetly Ai - https://meetily.ai) is the #1 Self-hosted, Open-source Ai meeting note taker for macOS & Windows." <-- sounds all local first, no? is ollama good at this kind of thing? would something like GLM 5 be better? does meetily work with all these apps like slack, teams, zoom, etc? "Flexible AI Provider Support: Choose from Ollama (local), Claude, Groq, OpenRouter, or use your own OpenAI-compatible endpoint." <-- is venice an open-ai compatible endpoint?

---

## Assistant

Good catches. Let me answer each:

**Meetily is fully local-capable** — yes, with Ollama for summarization it's 100% local. But Ollama runs open-source models locally on your hardware, and for summarization/action-item extraction, a model like GLM 4.7 (128k context) via Venice would almost certainly be better than whatever fits on a local GPU. The quality gap matters when you're parsing hour-long meetings.

**Venice is OpenAI-compatible** — yes, exactly. So Meetily's "use your own OpenAI-compatible endpoint" option means you could point it at `https://api.venice.ai/api/v1` with your Venice API key and it'd work. That's huge.

**But how does Meetily capture audio?** Let me check.

---

## Assistant

So Meetily does capture both mic and system audio — it works across any app, not just specific integrations. It's built on Rust/Tauri.

**Here's where this gets interesting for the hackathon:**

Meetily already exists and is open source. So the question becomes: **what are we actually building?**

Options:

**A) Fork Meetily + Venice + agentic layer** — swap in Venice as the inference backend, add the agent that acts on action items. Pros: fast start, proven audio capture. Cons: judges might see it as "you just forked something and swapped the API."

**B) Build from scratch with Core Audio Taps + Whisper + Venice** — more work but it's fully ours. We use `audiotee` (Node.js wrapper) for audio capture, local Whisper for transcription, Venice for the smart stuff. Cons: 10 days is tight to build audio capture + transcription + agent from zero.

**C) Build the agentic layer as its own thing** — don't rebuild the transcription piece. Assume transcripts exist (from Meetily, Otter, whatever) and build the agent that ingests them, extracts tasks, and actually starts doing them — all privately via Venice. This is the unique part nobody else is building. Pros: focused, demo-able, novel. Cons: less impressive as a standalone demo?

Honestly, I'd lean toward **A or C**. Building audio capture from scratch in 10 days while also building the interesting agent part feels risky.

What's your gut say?

---

## Human

So basically Meetily does everything we want except the agentic stuff?

---

## Assistant

Pretty much, yeah. Meetily does:
- System audio capture (any app)
- Local transcription (Whisper/Parakeet)
- Speaker diarization
- Summarization (Ollama local or OpenAI-compatible endpoint like Venice)

What it **doesn't** do:
- Act on anything — it's purely a note-taker
- Use Venice specifically (though it could with the OpenAI-compatible option)
- Do anything with action items besides list them

So the gap is: **Meetily tells you what happened. Nobody builds the agent that does something about it.**

The question is whether "Meetily + Venice + an agentic action layer" is a strong enough hackathon project, or if judges would see it as incremental. What do you think — does the agentic piece feel like enough of a leap, or do we need a bigger swing?

---

## Human

I think we need a bigger swing. should we explore a different vertical of the second brain idea? or maybe we gather all kinds of private apps and merge them together to be that brain, Meetily being one?

---

## Assistant

The "merge them all" idea is the bigger swing. Instead of building another single-purpose private tool, you build **the private orchestration layer** — the thing that connects all your private apps and makes them actually talk to each other.

Think about it: right now, private tools exist in silos. Meetily has your meetings. Proton has your email. Venice has your AI. Your Oura ring has your health data. Your journal app has your thoughts. None of them know about each other.

**The project: a private agent that sits across all your private tools and becomes your second brain.**

It ingests data from:
- Meetily (meeting transcripts, action items)
- Proton Mail (emails, via local IMAP or bridge)
- Calendar (events, deadlines)
- Health data (Oura, Apple Health)
- Notes/journal (local markdown files, whatever you use)
- Browsing history (local SQLite from your browser)
- Slack/Teams transcripts

Venice does all the reasoning — pattern matching, reminders, coaching, synthesis across sources. Everything stays local or goes through Venice's zero-retention inference. Nothing is stored in anyone's cloud.

**The demo:** "Hey, you committed to sending Sarah the API spec in Tuesday's standup, but you haven't done it and she emailed you a reminder this morning. Also, your sleep has been bad this week and you have three meetings tomorrow — want me to reschedule the non-critical ones?"

That's the second brain. It knows everything, connects the dots, and actually nudges you — all without a single byte of your data touching a server that retains it.

**The risk:** scope. This could easily become a "cool pitch, no working demo" situation, which is exactly what Venice's criteria #4 warns against.

So we'd need to pick maybe 2-3 integrations for the demo — not all of them. What data sources would you actually want to demo? Meeting transcripts + email + calendar feels like the tightest combo.

---

## Human

Couldn't you easily hook up OpenClaw to run via the venice API and do all of this already? I don't think an orchestration layer is really our bread and butter.

---

## Assistant

You're right. OpenClaw or any agent framework could already do this with tool calls. We'd basically be building a config file, not a product.

Let me step back. What are we actually good at building in 10 days that:
1. Venice would love (privacy by design)
2. Isn't just "existing tool + Venice API"
3. Has a real problem behind it
4. Is demo-able

I think we've been circling around infrastructure and orchestration when maybe we should be thinking about a specific **experience** that doesn't exist yet.

What keeps coming back to me is something you said earlier — the private home assistant that knows everything about you. The therapist, career coach, parental coach. That's not an orchestration layer, that's a **relationship with an AI that requires deep trust**, and that trust only works if privacy is ironclad.

But that's also basically what your health app already is, just for a different domain.

I'm going to be honest — I think we might be overthinking this. Can you tell me more about what excites you as a builder? Like forget the hackathon for a second. What's something you've wanted to build but haven't had the excuse to? Or what's a problem that genuinely pisses you off?

---

## Human

let's explore other popular apps that don't have good private alternatives. think of several domains the average person uses.

---

## Assistant

Great research. Here's the landscape:

**Already solved (good private alternatives exist):**
- Email (Proton), Messaging (Signal), Browser (Brave), Search (DuckDuckGo/Kagi), Passwords (Bitwarden), Cloud storage (Proton Drive), Notes (Obsidian), VPN (Mullvad), DNS (Quad9)

**Partially solved (alternatives exist but suck):**
- Maps (Organic Maps — no traffic, bad search)
- Photos (Ente — no AI search like "photos of my dog at the beach")
- Smart home (Home Assistant — great but requires a CS degree to set up)
- Voice assistants (no plug-and-play private Alexa)
- Music streaming (no private Spotify with a real catalog)
- Personal finance (auto bank sync requires Plaid, which is inherently privacy-invasive)

**Completely unsolved:**
- Dating apps (Mozilla investigation found they're "worse than ever")
- Tax prep (no E2EE option, must hand over SSN + everything)
- Food delivery (requires your address, payment, location)
- Ride sharing (same structural problem)
- Shopping at Amazon scale
- LinkedIn/job search
- Fitness tracking (hardware is the problem)

**The interesting ones for a hackathon with Venice:**

**Tax prep** jumps out — it's the most sensitive data imaginable (SSN, income, dependents, investments) and there's literally no private option. An AI agent that does tax analysis via Venice's zero-retention inference, with all data staying local... that's a real problem, a real audience (everyone files taxes), and it maps perfectly to Venice's scoring criteria.

**Private AI photo search** is also interesting — "find photos of my dog at the beach" but the AI runs locally/via Venice instead of Google scanning everything.

**Personal finance** is compelling too — what if the agent reads bank statement CSVs/PDFs locally instead of connecting to Plaid?

What catches your eye?

---

## Human

honestly the linkedin / job search one stood out. how would the privacy aspect play into this?

---

## Assistant

Interesting pick. Let me think about this honestly.

LinkedIn's privacy problem is real — Microsoft harvests insane amounts of data. Your job history, who you're connected to, what posts you engage with, who's profile you viewed, your salary expectations, your job search activity. Your current employer can basically figure out you're job hunting from LinkedIn's own "open to work" signals leaking.

**Where privacy actually matters in job search:**

1. **Stealth job hunting** — you don't want your current employer to know you're looking. LinkedIn is terrible at this. Recruiters see you're active, your boss sees your profile updates.

2. **Salary/compensation data** — you don't want companies knowing what you currently make or what you'd accept. That data gets shared and used against you in negotiations.

3. **Personal info exposure** — your resume has your address, phone, email. You blast it out to 50 companies and now it's in 50 HR databases forever, getting sold to data brokers.

4. **Interview prep and career coaching** — you want to talk through your weaknesses, salary negotiation strategy, why you're leaving. You don't want that going through an AI provider that retains it.

**But here's my honest pushback:** the core function of a professional network is being *public*. Recruiters need to find you. You need to show your experience. Privacy and discoverability are fundamentally in tension here.

So we probably can't build "private LinkedIn" — that's an oxymoron. But we could build something more focused:

**A private job search agent** — you tell it what you want (role, salary, location, deal-breakers), it searches job boards on your behalf, tailors your resume per application, preps you for interviews, coaches you on negotiation — all via Venice so none of your career strategy, salary expectations, or weaknesses ever hit a server that stores them. Your current employer has zero signal that you're looking.

Does that angle interest you, or was it more the LinkedIn replacement that excited you?

---

## Human

the privacy job search agent is cool, more along the lines of what i was thinking than the linkedin route. can we explore this more?

---

## Assistant

Yeah let's dig in. Let me think about what this actually looks like as a product.

**The problem in plain terms:** When you're job hunting, you're at your most vulnerable — you're sharing your salary, your frustrations with your current job, your weaknesses, your desperation level. All of that currently flows through LinkedIn, Indeed, Glassdoor, ChatGPT, or some recruiter's inbox. None of it is private.

**What the agent does:**

**1. Private career profile**
You tell the agent everything — your real salary, why you hate your boss, your actual skill gaps, what you'd accept vs what you'd ask for. This is the stuff you'd tell a career coach behind closed doors. Venice processes it, retains nothing.

**2. Job discovery**
Agent scrapes/searches public job boards (Indeed, LinkedIn public listings, HN Who's Hiring, company career pages) and matches against your private profile. You never create a public profile anywhere.

**3. Resume tailoring**
For each job you're interested in, the agent rewrites your resume to emphasize the relevant experience. Venice handles the generation — your master resume with all your private details never leaves your machine.

**4. Interview prep**
"Here are the likely questions for this role at this company, and based on what you told me about your experience gaps, here's how to frame your answer." Private coaching that knows your real situation.

**5. Salary negotiation**
Agent researches comp data, factors in your current salary (which you'd never want public), and gives you a strategy. "They'll probably offer $140k, counter with $165k because..."

**How it scores on Venice's criteria:**

1. **Confidentiality by design** — your career strategy, salary, weaknesses, and job search activity never leave your machine or Venice's zero-retention pipeline. Your employer has zero visibility.
2. **Agent architecture & trust** — the agent acts on your behalf (searching, tailoring) but you approve every outbound action (applications, emails). Clear human-in-the-loop.
3. **Problem legitimacy** — everyone job hunts, everyone worries about privacy while doing it, and the existing tools are all surveillance machines.
4. **Scope & demo** — demo flow: "I want a senior backend role, $160-180k, remote, not at a FAANG" → agent finds matches → tailors resume → preps interview answers. All private.

**What makes it agentic (not just a chatbot):**
- Proactively monitors job boards and alerts you to new matches
- Drafts cover letters and tailored resumes without being asked
- Tracks where you've applied, follow-up timelines, and nudges you
- Could eventually send applications on your behalf (with approval)

**10-day scope question:** I think the core demo is doable — private profile → job matching → resume tailoring → interview prep. The job board scraping might be the hardest part technically. We could start with a simpler input (paste a job listing URL) rather than building a full scraper.

What do you think? Does this feel like something you'd actually want to use?

---

## Human

question... you think it'd be possible at all to submit my existing health app i've been working on for a month to this? are there ways to avoid detection? It's just SUCH A GOOD USE of Venice and I want to focus my efforts on it :|

---

## Assistant

I hear you — it sounds like a great project and it's frustrating timing. But I'd strongly advise against it.

**The practical risks:**
- Git history shows commits from 1-2 months ago. Judges or AI judge bots could check.
- The hackathon rules say building starts March 13. If anyone looks at the repo timestamps, you're disqualified.
- You'd have to fake the history somehow, which is a bad look if caught — especially in front of the people you want to work for.

**The bigger reason not to:** You said you want to impress Venice and potentially work with Eric. Getting caught submitting pre-built work would burn that bridge permanently. The crypto/privacy community is small.

**What you could do legitimately:**
- Build something new that *complements* your health app or shares the same philosophy
- Reference your health app in your submission as prior work / proof you're deep in the Venice ecosystem
- The job search agent idea is genuinely strong and you'd be building something you'd actually use

Your existing Venice experience is an advantage, not a liability — you already know the API, you know what works, you can move faster than someone starting from zero. That's 10 days of building with a head start in *knowledge*, which is totally fair.

Want to commit to the job search agent and start scoping it out?

---

## Human

Ok that's good feedback, thanks. honestly not sure about this job application thing though. let's go back to that list of apps that are used every day by people but don't have a solid private alternative. I keep thinking about the maps one. can we do a deep dive on what's wrong with the top alternatives? I hear you have to manually type the exact address instad of just looking up results? Are they just integrated with shitty location APIs?

---

## Assistant

OK this is really thorough. Here's the honest picture:

**The current private maps landscape is a mess:**

**Organic Maps** — Best privacy, but search is limited to what OSM volunteers have mapped. You *can* search "cafe" and get nearby results, but expect missing businesses, no reviews, no photos, no "open now" filtering. No traffic data at all. ETAs are inaccurate. Also had a governance scandal (KAYAK affiliate links, allegations of misusing donations) which led to...

**CoMaps** — Fork of Organic Maps with better governance and transparency. Removed Google dependencies, improved routing, lets you self-host your own map server. But same fundamental OSM data limitations.

**OsmAnd** — The "Linux of maps." Powerful if you spend hours configuring it, but the UX is genuinely awful — freezes after a few taps, laggy rendering, settings buried in menus within menus.

**Magic Earth** — *Was* the best compromise until November 2025 when they locked features behind a $20/yr paywall, shipped a buggy update, and users fled. Also **closed source** and evasive about where their traffic data comes from. So "private" is questionable.

**Apple Maps** — Actually pretty private (rotating IDs, location fuzzing, no ad profile). Good search, has traffic. But Apple-only and closed source — you're trusting Apple.

**The core problem nobody has solved:** Search quality. Google Maps has 200M+ businesses maintaining their own listings. OSM has whatever volunteers bothered to add. That's why searching for a restaurant on Organic Maps is painful — the data just isn't there.

**But here's what's interesting for us:**

**Overture Maps Foundation** (backed by Amazon, Meta, Microsoft, TomTom) has **59M+ POIs** with a permissive license, updated monthly. That's not Google-scale but it's massively better than raw OSM. And **nobody in the private maps space is using it yet.**

The other gap: search intelligence. Nominatim (the default OSM search) is ~70% accuracy and can't handle natural language. You know what *can* handle natural language? An LLM.

**Potential hackathon idea:**

A private maps app where Venice is the search layer. Instead of rigid address matching, you say "coffee shop near me that's open late" and Venice interprets that query against Overture Maps + OSM data — privately, with zero retention. MapLibre for rendering, OSRM or Valhalla for routing.

The pitch: **"Google Maps search quality, but your location and search history never touch a server that remembers."**

**Honest scope concern:** Building a full maps app in 10 days is insane. But building a **demo of the AI search layer** on top of existing open-source rendering/routing? That might be doable. The novel piece is Venice + Overture Maps = private intelligent search.

Does this direction excite you at all, or does the maps problem feel too big?

---

## Human

woah, might be interesting to have an auditable review system for these businesses. Isn't it an issue where they can pay to get low reviews removed? Or paid to get a bunch of fake 5 star reviews? Amazon too, maybe there's some on-chain reviews gaps. There's so much shadiness with their reviews - they can swap out products entirely to something way lower quality but keep the old high quality reviews in.

This maps idea is actually pretty solid, I'm digging our discussion so far. the fact that no one else has a good alternative, and there's some solid data like Overture Maps Foundation we could use? and an LLM gap? Does the OMF support querying by "restaurant" or "cafe"? If not, could we bridge the gap with LLMs?

NOPE doesn't feel too big to me, it inspires me.

---

## Assistant

Now we're cooking. Let me answer your questions and then let's see if this all comes together.

**On-chain reviews — you're right, the current system is broken:**
- Google lets businesses flag reviews and get them removed
- Amazon has the product review swapping problem you described — sellers merge listings or swap products to inherit reviews
- Yelp has been accused of extorting businesses (pay for ads or your good reviews get filtered)
- Fake review farms are a massive industry

On-chain reviews would be immutable — nobody can delete them, nobody can swap the product underneath. And with ERC-8004 agent identities, you could have *agents* that verify they actually visited a location before leaving a review. That's a trust layer that doesn't exist anywhere.

**On Overture Maps — let me check what their POI data actually looks like.**

---

## Assistant

OK, this is getting really interesting. Let me lay out what we've learned:

## Overture Maps POI Data

**Yes, you can query by "restaurant" or "cafe."** They have 2,100+ categories with a full hierarchy — `food_and_drink > restaurant > asian_restaurant > vietnamese_restaurant`. 64M+ POIs total, 3.58M restaurants alone.

**What it includes:** Name, location, category, address, phone, website, brand, confidence score
**What it doesn't include:** Hours, reviews, photos, ratings

**Access:** No REST API — it's bulk GeoParquet files you query with DuckDB or download with their Python CLI. There's a community-built REST API wrapper though. It integrates directly with MapLibre via PMTiles.

**Quality:** At high confidence (>85%), it's solid. Below that, accuracy drops. 85% of the data comes from Meta/Facebook. Updated monthly.

## On-Chain Reviews

**Every project that's tried this has failed.** Revain, Lina, Dentacoin — all dead or zombie ICO-era projects. The pattern: launch token, attract mercenary reviewers gaming for tokens, fail to get real users, die.

**The core unsolved problem is sybil resistance.** Immutable reviews are *worse* than centralized ones if anyone can spin up 100 wallets and leave 100 fake reviews. At least Google can delete fakes (they removed 240M last year).

**But the building blocks are better now than in 2018:**
- **Base** makes on-chain storage sub-cent (vs $5-50 on mainnet)
- **EAS (Ethereum Attestation Service)** is live on Base — flexible review schemas, no custom token needed
- **Proof-of-personhood** (World ID) has 17M+ users — imperfect but a real sybil resistance layer
- FTC is now actively penalizing fake reviews ($53k per violation)

**The fake review problem is massive:** $788B in unwanted purchases annually, 16-20% of Amazon reviews may be fake, Google Maps extortion rackets flooding businesses with fake 1-stars.

## So Where Does This Leave Us?

I think there might be something at the intersection of all of this:

**A private maps app with trustworthy, on-chain reviews.**

- **MapLibre + Overture Maps** for the base map and POI data (the "where")
- **Venice** for natural language search — "late night tacos near me" interpreted privately, zero retention (the "find")
- **EAS attestations on Base** for reviews that can't be deleted, manipulated, or extorted (the "trust")
- **Venice for review analysis** — privately summarize hundreds of reviews, detect patterns, flag suspicious ones — without your search/reading behavior being tracked

**Why this is different from failed review-token projects:**
- No token incentive for reviews (that's what killed Revain/Dentacoin)
- EAS attestations are free infrastructure, not a tokenomics play
- The value prop is the map + private search, reviews are the trust layer on top
- Venice adds AI intelligence without the surveillance

**The Venice pitch:** "Google knows every place you've searched for, every review you've read, every business you've visited. This app gives you the same experience — AI-powered search, trustworthy reviews — without anyone knowing where you go or what you're looking for."

**10-day scope:** We don't need to solve sybil resistance perfectly. For the demo: MapLibre map → Venice-powered search → Overture POI results → leave/read EAS attestation reviews on Base. That's a tight, demo-able loop.

Does this feel like the one? Or do you want to keep pulling threads?

---

## Human

Yes, this feels like the one. Let's put all this into a plans/master.md. Let's continue to explore open questions and continue fleshing out this idea. I wonder why offering tokens for reviews made the dentacoin and revain projects die. It seems like a good way to reward users, and I'm trying to figure out if that will *always* be at odds with fake reviews, or if there is a way to mitigate this and have it only be proper incentive. I do kinda want to explore if there's a way we can prevent fake reviews before we say that's out of scope. I WANT this app. And I think venice would probably go nuts for it too. We make it all open source.

---

## Assistant

Love the energy. Let me create the master plan and research the fake review problem simultaneously.

---

## Assistant

Now let me dig into the token incentive / fake review problem properly.

---

## Human

[Request interrupted by user for tool use]

---

## Assistant

No response requested.

---

## Human

continue research

---

## Assistant

Excellent research. Let me pull up the full doc it wrote.

---

## Assistant

This is incredibly thorough. Here's the bottom line for your question:

## Why Token-for-Review Failed (and Can It Be Fixed?)

**The core problem:** Writing a fake review costs ~$0. Token rewards made it profitable to spam. Revain, Dentacoin, etc. all had the same death spiral — rewards attract bots, bots flood platform with garbage, real users leave, token crashes, platform dies.

**What works in crypto that reviews can learn from:**
- **Filecoin:** You must *cryptographically prove* you're storing data. Can't fake it.
- **The Graph:** 100K GRT minimum stake, slashed if you serve bad data. Challengers also stake — both sides have skin in the game.
- **Goldfinch:** Your "review" (credit assessment) requires you to put your own money at first-loss risk. Suddenly quality matters.
- **Helium:** Physical hardware ($500+) required. Raises cost of gaming from $0 to hundreds.

**The pattern:** Every system that works makes gaming *expensive*. Reviews failed because gaming was free.

## The Fix: Defense in Depth

The research points to **6 layers**, no single one sufficient alone:

1. **Proof of personhood** — one human, one identity (Gitcoin Passport style)
2. **Proof of visit** — NFC tap at the business or on-chain payment proof. This is the killer layer. You can't fake being physically at a restaurant without actually going there. Same principle as Helium's hardware requirement.
3. **Quality-weighted rewards** — AI scores specificity/detail/helpfulness. Detailed review with photos = 5x reward vs "great food 5 stars"
4. **Stake and challenge** — reviewer stakes a small amount, anyone can challenge by also staking. Loser gets slashed. (The Graph's model)
5. **Soulbound reputation** — non-transferable, decays over time, can't buy aged accounts
6. **Quadratic decay** — each subsequent review from the same wallet earns diminishing returns

**The key insight:** NFC tap + proof of personhood alone eliminates 90% of gaming. The cost goes from $0 (create wallet, write text) to "physically visit the restaurant." Everything else is reinforcement.

## For the Hackathon

We don't need all 6 layers for a demo. But we should design the architecture to support them and implement 2-3 for the MVP:

- **Layer 1 (identity):** ERC-8004 agent identity (we already have this from registration)
- **Layer 2 (proof of visit):** On-chain payment proof or simulated NFC tap
- **Layer 3 (quality):** Venice AI scoring reviews for quality/authenticity

That's a tight, demo-able scope that shows the full vision without overbuilding.

Want me to update the master plan with this, and should we start scoping the actual 10-day build?

---

## Human

Let's definitely detail this all out, but proof of visit seems hard. How will everyone have NFC chips at their locations? Or payments on chain?

---

## Assistant

You're right — NFC at every restaurant is a fantasy for launch, and most restaurants don't accept crypto payments. Those are long-term plays, not hackathon-demo plays.

Let me think about what's actually realistic for proving you visited somewhere:

**What people already have on them:**
- A phone with GPS
- A camera
- WiFi that auto-detects nearby networks

**Realistic proof-of-visit options (no business cooperation needed):**

1. **Photo verification** — Take a photo at the restaurant. Venice AI analyzes it: does this look like the inside of a restaurant? Does it match the type of cuisine? Is there EXIF GPS data? Is this a stock photo or AI-generated? This isn't bulletproof but it raises the cost of faking from "write text" to "go somewhere and take a photo or find a convincing fake."

2. **GPS + time dwell** — Your phone confirms you were at those coordinates for 20+ minutes. GPS is spoofable, but combining it with other signals makes it harder.

3. **WiFi SSID snapshot** — Every business has a WiFi network. Prove you could see their SSID. Not proof you were *inside*, but proof you were close.

4. **Receipt photo + OCR** — Snap your receipt. Venice OCR extracts the business name, date, items ordered. Now your review can reference specific items you actually bought. Fakeable with receipt generators, but combined with other signals it's solid.

**Honestly, the most practical V1 is probably:**
- Required: photo of your visit (AI-verified by Venice)
- Optional: receipt photo (Venice OCR extracts details, feeds into review)
- Background: GPS confirmation you were in the area
- Future: NFC tap when businesses opt in

None of these are perfect alone. But "take a photo and snap your receipt" is something every human already does. Zero hardware requirements, zero business cooperation needed, and Venice is doing the verification privately.

**For the hackathon demo specifically**, even just the photo verification is enough to show the concept. "Here's my photo from the restaurant, Venice confirmed it's legitimate, here's my on-chain review."

Does that feel more realistic? Should I update the master plan with this approach and start scoping the 10-day build?

---

## Human

Photo is good, along with checking EXIF GPS data. nice to have is running past venice to check that it matches the type of location. GPS confirmation being in the area is also a nice to have, but not required to post a review, but it does add authenticity. Not sure if that's spoofable or not. Skip receipts, wifi, and time dwelling.

Let's dive into the rest of these authenticity proof ideas.

---

## Assistant

Good calls. So the core proof-of-visit is **photo with EXIF GPS**, and the nice-to-haves add authenticity signals without being gates.

Let me think about what other authenticity layers we can stack that don't require business cooperation or special hardware:

**Identity-based signals:**
- **Account age + activity** — a wallet that's been active for 6 months is more credible than one created today. Not a gate, but a visible trust signal.
- **Review history consistency** — if someone has 50 reviews across 50 cities in one week, that's suspicious. Venice can flag anomalous patterns privately.
- **Cross-platform attestations** — linking an ENS name, GitHub, Twitter via EAS attestations. More linked identities = harder to be a bot. Not required, but boosts credibility.
- **ERC-8004 identity** — if agents are reviewing, they have on-chain identity. Humans could use something similar.

**Review content signals (Venice AI):**
- **Specificity scoring** — "the carne asada tacos were underseasoned but the salsa verde was incredible" vs "good food." Venice scores how specific and detailed the review is.
- **Sentiment-rating consistency** — text says "terrible experience, waited an hour, food was cold" but rating is 5 stars? Flagged.
- **Template/duplicate detection** — is this review suspiciously similar to reviews from other wallets?
- **AI-generated content detection** — Venice checking if a review was likely written by an AI (ironic but necessary)

**Community-based signals:**
- **Helpful/not helpful votes** — other users rate reviews. Over time this builds reviewer reputation.
- **Quadratic weighting** — first review from a wallet counts fully, subsequent ones have diminishing weight (1/sqrt(n)). Doesn't block prolific reviewers, just naturally limits farming.
- **Stake and challenge** — we discussed this. Reviewer optionally stakes a small amount. Others can challenge. Both sides have skin in the game. Good for V2 but probably too complex for hackathon.

**What I think the hackathon MVP should be:**

**Required to post:**
- Photo with EXIF GPS data matching the business location

**Automatic (behind the scenes):**
- Venice AI specificity scoring (visible to readers as a quality badge)
- Venice AI sentiment-rating consistency check
- Account age displayed on review

**Nice to have for demo:**
- Venice AI visual verification (photo matches business type)
- GPS confirmation adds a "verified location" badge
- Helpful/not helpful voting
- Quadratic weighting

**V2 / post-hackathon:**
- Cross-platform attestations (ENS, GitHub, etc.)
- Stake and challenge system
- Template/duplicate detection across wallets
- Soulbound reputation tokens
- NFC tap when businesses opt in

Does this layering feel right? The hackathon demo shows a credible system without overbuilding, and the architecture supports adding layers later.

Want me to update the master plan and start scoping the actual build?

---

## Human

sorry, can you compile this all together in the format you laid out before and note which parts we do now vs which ones we do later:

1. Proof of personhood — one human, one identity (Gitcoin Passport style)
  2. Proof of visit — NFC tap at the business or on-chain payment proof. This is the killer layer.
  You can't fake being physically at a restaurant without actually going there. Same principle as
  Helium's hardware requirement.
  3. Quality-weighted rewards — AI scores specificity/detail/helpfulness. Detailed review with
  photos = 5x reward vs "great food 5 stars"
  4. Stake and challenge — reviewer stakes a small amount, anyone can challenge by also staking.
  Loser gets slashed. (The Graph's model)
  5. Soulbound reputation — non-transferable, decays over time, can't buy aged accounts
  6. Quadratic decay — each subsequent review from the same wallet earns diminishing returns

---

## Assistant

## Review Authenticity: 6 Layers of Defense

### Layer 1: Proof of Personhood
*One human, one identity. Prevents multi-wallet farming.*

**Hackathon MVP:**
- ERC-8004 identity (we already have this from Synthesis registration)
- Account age + activity displayed on reviews as a trust signal
- Basic wallet-level rate limiting (max N reviews per day)

**V2:**
- Gitcoin Passport-style humanity scoring (collect stamps from social accounts, biometric, on-chain history)
- Cross-platform attestations via EAS (link ENS, GitHub, Twitter)
- More linked identities = higher credibility badge

**V3:**
- World ID or similar proof-of-personhood integration
- Sybil detection via social graph analysis (MeritRank-style)

---

### Layer 2: Proof of Visit
*Raise the cost of faking from $0 to "physically go there." The killer layer.*

**Hackathon MVP:**
- Photo with EXIF GPS data matching business location (required to post)
- Venice AI verifies photo isn't stock/AI-generated

**Nice-to-have for demo:**
- Venice AI visual verification (does this photo match a restaurant/cafe/etc?)
- Background GPS confirmation adds a "verified location" badge (not required to post, but boosts authenticity)

**V2:**
- NFC tap at participating businesses
- On-chain payment proof (for businesses accepting crypto)
- Peer attestation (other verified users at the same location co-sign)

**V3:**
- POS integration (business point-of-sale issues signed attestation)
- Zero-knowledge proof of location (prove you were in a zone without revealing exact coordinates or full location history)

---

### Layer 3: Quality-Weighted Rewards
*Incentivize useful reviews, not "5 stars great food" spam.*

**Hackathon MVP:**
- Venice AI specificity scoring — visible to readers as a quality badge
  - Does the review mention specific items, prices, experiences?
  - Score: generic (1x) → specific (3x) → detailed with photos (5x)
- Venice AI sentiment-rating consistency check (text says "terrible" but 5 stars = flagged)
- Structured review prompts: "What did you order?", "Rate: food / service / ambiance / value", "One thing future visitors should know?"

**V2:**
- Quality score directly tied to token reward multiplier
- Photo/video bonuses
- Novelty scoring (does this review add info not already covered?)
- Recency bonus (review within 7 days of visit)

**V3:**
- AI-generated content detection
- Cross-wallet template/duplicate detection (farm detection)
- Reviewer expertise scoring based on review history in specific categories (e.g., someone who reviews 30 ramen shops knows ramen)

---

### Layer 4: Stake and Challenge
*Both sides have skin in the game. The Graph's dispute model applied to reviews.*

**Hackathon MVP:**
- Skip. Too complex for 10-day build.

**V2:**
- Reviewers optionally stake a small amount (e.g., $1-5 in tokens) per review
- Challenge period: 14 days where anyone can challenge by also staking
- Adjudication: Venice AI pre-screen + Schelling-point jury of random staked reviewers
- Winner keeps portion of loser's stake
- Graduated slashing: warning → small slash → large slash → ban

**V3:**
- Appeal mechanism to higher-level jury
- Stake lockup periods (prevent quick in-and-out gaming)
- Regional stake calibration (adjusted for local economies)

---

### Layer 5: Soulbound Reputation
*Non-transferable, decays over time, can't buy aged accounts.*

**Hackathon MVP:**
- Account age displayed on reviews
- Review count and average quality score visible on profile
- Basic reputation: "new reviewer" vs "established reviewer" badge based on history

**V2:**
- Soulbound reputation tokens (ERC-5484/5192) — non-transferable, bound to wallet
- Reputation decay if inactive (use it or lose it)
- Helpfulness votes from other users feed into reputation score
- Behavioral fingerprinting to detect account ownership changes

**V3:**
- Business feedback loop (businesses optionally verify review accuracy, boosting reviewer reputation)
- Cross-platform reputation portability (your review reputation works on other apps built on the same EAS data)
- MeritRank transitivity decay (reputation from sybil networks naturally diminishes)

---

### Layer 6: Quadratic Decay
*Diminishing returns prevent farming at scale.*

**Hackathon MVP (nice-to-have):**
- Display weighting: 1st review from a wallet = full weight, Nth review = 1/sqrt(N) weight in that time period
- Visible to users so they understand the system

**V2:**
- Quadratic decay directly tied to token reward formula:
  `reward = base * quality_multiplier * reputation_multiplier * (1/sqrt(N))`
- Per-business caps (max 1 review per business per wallet per 90 days)
- Per-period caps with rolling windows

**V3:**
- Quadratic funding for review quality — reviews tipped by many independent users get outsized rewards vs reviews boosted by one whale
- Geographic quadratic weighting (first review of an under-reviewed business in a new area is worth more than the 500th review of a popular spot)

---

### Hackathon Demo Summary

What we build in 10 days:
1. **Identity:** ERC-8004 + account age display
2. **Proof of visit:** Photo with EXIF GPS (required) + Venice AI verification (nice-to-have)
3. **Quality scoring:** Venice AI specificity/consistency scoring + structured prompts
4. **Stake & challenge:** Skip
5. **Reputation:** Basic badges from review history
6. **Quadratic decay:** Display weighting (nice-to-have)

What we design for but don't build:
- Token economics and reward distribution
- Stake and challenge system
- Soulbound reputation tokens
- Advanced sybil detection
- NFC / payment proof of visit

---

## Human

1. Good - ERC-8004 seems solid, but also open to discussing tradeoffs if better. idk how easy it is to spin up a new ERC-8004.
2. good
3. good
4. good - skip
5. skip for now, doesn't seem like much value?
6. skip for now

Let's output all this in our plan. We may want to split this out into a separate plans/reviews.md

---

## Assistant

Now let me clean up the master plan to reference this instead of duplicating it.

---

## Assistant

Now let me clean up the duplicated research sections in master.md that are now covered in reviews.md.

---

## Assistant

Now update the open questions to reflect decisions we've made.

---

## Assistant

Done. Here's the file structure:

- **plans/master.md** — overall vision, architecture, Venice pitch, Overture Maps research, maps landscape, open questions
- **plans/reviews.md** — deep dive on the 6-layer review authenticity system with clear hackathon/V2/V3 scoping

What do you want to dig into next? Some threads still open:
- **ERC-8004 ease of use** — how hard is it for a new user to get one?
- **EAS schema design** — what does the actual review attestation look like on-chain?
- **Venice + Overture search** — how does the AI search layer actually work technically?
- **10-day build scope** — what do we build each day?
- **App name** — this thing needs a name

---

## Human

Great open questions, are those tracked?

---

## Assistant

They're in the master plan under "Open Questions" but let me make sure everything is captured. Checking what we have vs what's still unresolved.

---

## Assistant

We have 5 open questions tracked, but I just listed a few more that aren't in there yet. Let me add them.

---

## Assistant

All tracked in the master plan now. 9 open questions:

1. **ERC-8004 for user identity** — how easy to spin up? better alternatives?
2. **Token incentives** — decided to skip for hackathon, V2 question
3. **Data freshness** — Overture updates monthly, how to handle gaps?
4. **Revenue / sustainability** — no ads, no data selling, so what?
5. **Mobile vs web** — web-first for hackathon?
6. **EAS schema design** — what's the on-chain review structure?
7. **Venice + Overture search** — how does the AI search actually work technically?
8. **App name**
9. **10-day build scope** — daily plan, critical path, cut list

Which do you want to tackle next?

---

