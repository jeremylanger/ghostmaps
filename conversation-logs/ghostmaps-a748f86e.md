# Conversation: ghostmaps (a748f86e)

## Human

why didn't our push to main auto deploy to railway?

---

## Assistant

Let me check the Railway configuration and deployment setup.

---

## Assistant

Railway is deploying via `railway up` (CLI pushes), not via GitHub integration. Your deployments are all manual CLI deploys — there's no GitHub repo connected to Railway for auto-deploy.

To enable auto-deploy on push to main, you need to connect your GitHub repo in the Railway dashboard:

1. Go to **Railway dashboard → ghostmaps project → Settings → Source**
2. Connect the **jeremylanger/ghostmaps** GitHub repo
3. Set the deploy branch to `main`

After that, every push to `origin/main` will trigger an automatic deploy. Until then, you need to run `railway up` manually after each push.

---

## Human

it already is

---

## Assistant

Got it, the GitHub integration is set up. Let me check if the latest commit actually made it to GitHub.

---

## Assistant

The latest commit (`803a45e`) is on GitHub. So the push succeeded but Railway didn't deploy it. The last successful Railway deploy was at `2026-03-19 23:36:00` — let me check when that commit was pushed.

---

## Assistant

That explains it. The last successful Railway deploy (`23:36:00`) corresponds to commit `6cccde2` (`23:35:58`). Your latest commit `803a45e` was made at `09:16:03` today — it likely deployed and **failed the build**.

---

## Assistant

There's no deployment after `23:36` — Railway never even attempted to deploy `803a45e`. The commit is on GitHub but Railway didn't pick it up.

This is likely a **webhook delivery issue** between GitHub and Railway. A few things to try:

1. **Re-trigger manually** — push an empty commit or run `railway up`
2. **Check GitHub webhook deliveries** — go to GitHub repo **Settings → Webhooks**, find the Railway webhook, and check if the delivery for that push failed or was never sent
3. **Disconnect and reconnect** the repo in Railway settings to re-register the webhook

Quickest fix right now: `railway up` to deploy manually. Then check the GitHub webhook to see why it didn't fire.

---

