# Age Journey

A lightweight mobile-friendly web prototype for exploring a person's appearance across ages **0–90**.

## Run
Open `index.html` in a browser, or enable **GitHub Pages** under Settings → Pages → Deploy from a branch → main / (root).

## What works
- Upload or drag-and-drop a portrait.
- Scrub the age slider from 0 to 90, or tap an age milestone.
- Add separate portraits to chosen ages. The slider shows the nearest available portrait and clearly labels its age.
- Images remain local to the browser session; no backend and no dependencies.

## Not yet implemented
AI age transformation. The interface deliberately does **not** claim that changing the slider generates a new face. For a production version, implement a server-side image-generation endpoint with age-conditioned image editing, authentication, consent/guardrails for portraits of children, server-side API keys, caching and deletion controls. Never expose API keys in browser JavaScript.
