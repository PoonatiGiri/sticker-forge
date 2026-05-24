# StickerForge

AI-powered sticker and mascot generator for indie makers and small businesses.

Generate branded character stickers in seconds — guided by business category, mascot style, and visual vibe. Supports inspiration image uploads for mood-board-driven generation.

## Stack

- **Frontend** — Vanilla HTML/CSS/JS (single file, no build step)
- **Backend** — Node.js + Express
- **AI** — OpenAI `gpt-image-1` (image generation) + `gpt-4o-mini` (inspiration image analysis)

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Copy env and add your OpenAI key
cp .env.example .env

# 3. Start the server
npm start
# → http://localhost:3456
```

## Environment variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |
| `PORT` | Server port (default: 3456) |

## Deploying to Railway

1. Push this repo to GitHub
2. Create a new project on [railway.app](https://railway.app)
3. Connect your GitHub repo
4. Add `OPENAI_API_KEY` as an environment variable in Railway
5. Deploy — Railway auto-detects Node.js and runs `npm start`
