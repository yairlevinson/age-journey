# Age Journey

Upload a portrait once, and see **AI-generated age transformations** automatically at ages 0, 7, 16, 30, 45, 60, 75, and 90. Explore the results with an age slider. Ages between generated milestones display the nearest available portrait (not synthesized intermediate frames).

## Deploy the front-end

GitHub Pages publishes `index.html` at https://yairlevinson.github.io/age-journey/ via `.github/workflows/deploy.yml`.

## Deploy the AI backend

GitHub Pages cannot store a secret OpenAI API key. This repository contains a Cloudflare Worker proxy, `worker/index.js`, which calls the OpenAI Images Edits API using `gpt-image-2.5-flare`.

1. Create a Cloudflare account and install [Node.js](https://nodejs.org/).
2. Clone the repository and run `npx wrangler login` and `npx wrangler deploy` from the project directory.
3. Set the two Worker secrets from a terminal:

   ```sh
   npx wrangler secret put OPENAI_API_KEY
   npx wrangler secret put ACCESS_TOKEN
   ```

   `OPENAI_API_KEY` is your OpenAI Platform API key (billing may be required). `ACCESS_TOKEN` is a long random secret you choose to restrict who can generate images and incur costs.
4. Redeploy if necessary with `npx wrangler deploy`. Copy the resulting `https://...workers.dev` URL.
5. Open the GitHub Pages app → **AI connection settings** → enter the Worker URL and `ACCESS_TOKEN` → **Save connection**.
6. Upload a JPEG, PNG or WebP photo (max 5 MB). Generation starts automatically. Images are sent to your Worker and OpenAI, not stored in GitHub Pages.

**Privacy & cost:** Photos, including children's photos, should be uploaded only with appropriate consent. The Worker does not persist images, but they are transmitted to Cloudflare and OpenAI for processing. Each generated portrait is an API call and incurs charges. Generated pictures are illustrative fiction—not reliable predictions. Client storage is session-limited and resets on refresh. Keep secrets out of the GitHub repository. The access token is stored in browser session storage, so avoid using this app on a shared computer.

## Current limitations

- The backend is not deployed until you configure your own Cloudflare Worker and secrets.
- The slider shows the nearest generated milestone; it does not continuously morph between ages.
- Generation is sequential, and the browser must remain open until completion.
- This demo uses one shared secret and has no user accounts, quotas or production-grade abuse controls. For public multi-user access, add sign-in and per-user rate limits, budget controls and a privacy/deletion policy.
