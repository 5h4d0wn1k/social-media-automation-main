# Social Media Automation — Scheduling & Content Platform

Social media automation and content scheduling platform that schedules posts,
manages campaigns and hashtags, ingests RSS feeds, and generates AI captions —
across 8 networks — with a Vercel-deployable React + TypeScript stack.

[![Stars](https://img.shields.io/github/stars/5h4d0wn1k/social-media-automation-main)](https://github.com/5h4d0wn1k/social-media-automation-main)
[![Issues](https://img.shields.io/github/issues/5h4d0wn1k/social-media-automation-main)](https://github.com/5h4d0wn1k/social-media-automation-main/issues)
[![Last commit](https://img.shields.io/github/last-commit/5h4d0wn1k/social-media-automation-main)](https://github.com/5h4d0wn1k/social-media-automation-main)

## Why

Content teams lose hours jumping between apps to schedule a single campaign.
This platform consolidates the daily social workflow into one dashboard: create
a post once, schedule it to multiple networks, attach hashtags, track analytics,
and pull in fresh material from RSS feeds — all in one place. A DeepSeek-backed
content generator drafts captions so the editor starts from a strong first
draft instead of a blank box. Because the app runs on a Vite + React +
TypeScript frontend with a single Vercel serverless API endpoint, it deploys in
minutes, scales for free on the hobby tier, and keeps platform integrations in
one maintainable handler.

## Features

- **Post scheduler** — time-based scheduling and automation with cron support
- **Post & campaign creation** — multi-step creators with campaign management
- **8 social platforms** — integrations for Twitter/X, LinkedIn, Facebook,
  Instagram, YouTube, Telegram, WhatsApp, and GitHub (Vercel serverless API in
  `api/social/index.ts` with per-platform handlers)
- **AI caption generation** — DeepSeek-powered content generation (`src/lib/ai.ts`)
- **Hashtag manager** — build and reuse hashtag sets
- **RSS feed manager** — import and schedule content from feeds
- **Analytics dashboard** — chart-based post and platform performance
- **Content calendar** — visual scheduling view
- **Automation manager** — rule-based posting workflows
- **WhatsApp setup wizard** — guided WhatsApp integration
- **Vercel-ready** — `vercel.json` rewrites + serverless function config

## Quickstart

```bash
npm install
npm run dev        # starts the Vite dev server
```

Set your environment variables in `.env` (see `.env.development` conventions):

- `VITE_API_KEY` — secret for securing API endpoints
- `VITE_API_URL` — API base URL (auto-set on Vercel)
- `VITE_IS_DEVELOPMENT=false` — switch from mock data to real platform API calls
- Per-platform credentials (Twitter, LinkedIn, Facebook, etc.) and
  `DEEPSEEK_API_KEY` for AI captions

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Vercel automatically uses the `vercel.json` configuration (API rewrites +
function memory/timeout), and the frontend connects to the correct API URL in
production.

## Project structure

- `src/components/` — scheduler, creator, campaign, calendar, hashtags, RSS,
  analytics, WhatsApp, automation UIs
- `src/lib/` — AI (`ai.ts`), scheduling (`cron.ts`, `browser-cron.ts`), store, RSS
- `api/social/` — consolidated Vercel serverless handler + platform modules
- `vercel.json` — deployment and rewrites configuration

## Contributing

Fork, create a feature branch, and open a pull request.

## License

License not yet specified — contact the maintainer before reusing the codebase.