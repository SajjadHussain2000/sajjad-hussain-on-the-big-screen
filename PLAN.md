# Portfolio Website — Project Plan

> Status: Planning · Last updated: 2026-10-17

## 1. Vision

A personal portfolio for a frontend / fullstack developer that is **memorable, useful, and personal**, inspired by (not copied from) the best developer sites:

| Inspiration | What we take | What we do differently |
|---|---|---|
| **Bruno Simon** (bruno-simon.com) | Visitors *play*, *leave a mark*, and *compete* on a leaderboard | No 3D car — an original **Bug Hunt** game that makes visitors explore the portfolio itself |
| **Josh W. Comeau** (joshwcomeau.com) | Friendly typography, an articles section with rich visuals and subtle animation | Free fonts, own visual voice, own topics |
| **Newsletters** (e.g. Buttondown-style) | Email newsletter, one new topic per issue | Archive lives on the site, issues tie back to articles |

### Goals
1. Showcase skills and projects to **both** technical and non-technical visitors (HR, recruiters, engineers).
2. Make visitors **stay and explore** (Bug Hunt).
3. Build an audience over time (articles + newsletter).

### Non-goals (for now)
- No CMS — articles are MDX files in the repo.
- No user accounts — visitors only enter a display name.
- No self-built email infrastructure.

---

## 2. Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Next.js (App Router)** | SSG for articles, API routes for game/newsletter, one deploy |
| Content | **MDX** (`@next/mdx` or `next-mdx-remote`) | Embed live React components inside articles |
| Styling | **CSS Modules + CSS variables** (or Tailwind) | Light/dark theming without extra libraries |
| Animation | **Motion** (formerly Framer Motion) | Spring physics for micro-interactions |
| Code demos | **Sandpack** | Live, editable code playgrounds in articles |
| Fonts & colours | `next/font`: **Bricolage Grotesque** (headings + logo), **Plus Jakarta Sans** (body), **Caveat** (handwritten accent, e.g. the guide's name tag), **JetBrains Mono** (code). Palette from joshwcomeau.com: dark `#0d0f12` bg, `#809fff` primary, `#ff1a81` pink; light white bg, `#4242fa`, `#e60067` | Clean, readable type with Josh Comeau's colours |
| Data store | **Upstash Redis** | Sorted sets = leaderboards in one command; free tier |
| Rate limiting | `@upstash/ratelimit` | Protect public write endpoints |
| Newsletter | **Buttondown** (alt: Resend Broadcasts) | Double opt-in, unsubscribe, compliance, archive API |
| OG images | `next/og` | Auto-generated social cards per article |
| Hosting | **Vercel** | Free tier, native Next.js support |
| Analytics | Vercel Analytics or Plausible | Privacy-friendly, no cookie banner |

---

## 3. Sitemap

```
/                     Hero, intro, featured articles, Bug Hunt teaser, newsletter CTA
/about                Bio, experience, résumé download
/projects             Project grid
/projects/[slug]      Case study
/articles             Article index, tag filter
/articles/[slug]      MDX article with interactive components
/newsletter           Subscribe form + archive of past issues
/hall-of-debuggers    Bug Hunt leaderboards + visitor signatures
/bug-hideout          Hidden page (Bug Hunt technical bug #9)
/rss.xml              RSS feed
/robots.txt           Includes the Bug Hunt clue
```

---

## 4. Feature: Bug Hunt (the game)

### 4.1 Concept
Bugs are hidden across the website. Visitors race to find them all, then **sign the Hall of Debuggers** with their name and time. Playing the game *is* browsing the portfolio — every bug sits next to something worth seeing.

### 4.2 Game flow
1. A small **bug jar** is fixed in the corner of every page. Clicking it opens the hunt panel.
2. Visitor chooses a mode:
   - **Quick Hunt** — 6 visual bugs. Designed for non-technical visitors (HR, recruiters).
   - **Full Hunt** — all 10 bugs (visual + technical).
3. **Start** → server issues a session with a start timestamp. Jar shows progress (`🐛 3/6`).
4. **Catching a bug:**
   - Visual bug → click it → squash animation → it flies into the jar.
   - Technical bug → reveals a **code word** → visitor types it into the jar.
5. **Hint** button: one hint per bug, **+15 s penalty** each, so nobody gets stuck.
6. **Finish** → sign the Hall of Debuggers: name, time, optional one-line message.
7. Separate leaderboards for Quick and Full Hunt.

### 4.3 Visual bugs (non-technical)

| # | Location | Bug | Hint |
|---|---|---|---|
| 1 | Every page | A pixel-art software bug (green shell, 2-frame walk cycle, 8-direction sprite) creeps along the screen edges and sometimes climbs onto the avatar's hoodie. It freezes up when the pointer gets close. A click within 50px squashes it and a "✓ fixed" badge pops up. | "A little bug creeps along the edges of the screen…" |
| 2 | About | A typo in the bio ("Sofware Engineer") — click the word | "Even I make typos." |
| 3 | About | Hovering my photo makes a bug peek out from behind it | "Say hi to me." |
| 4 | Projects | One project thumbnail has a tiny ladybug sticker | "One of my projects has a visitor." |
| 5 | Home ("Let's work together" box) | A still, glowing beetle that only appears in **dark mode** | "Turn off the lights." |
| 6 | Footer | A bug sleeping on the copyright line | "Go all the way down." |

### 4.4 Technical bugs (beginner-friendly)

| # | Location | Bug | Hint |
|---|---|---|---|
| 7 | Browser console | Console prints `🐛 psst… call catchBug()`; calling it prints a code | "Developers have a console for this." |
| 8 | Page source | HTML comment `<!-- bug code: SEMICOLON -->` | "View the source, Luke." |
| 9 | `/robots.txt` | Contains `Disallow: /bug-hideout`; that page shows a code | "Even robots have rules." |
| 10 | Network tab | An API response has header `X-Bug: TYPO404` | "Check your headers." |

All technical bugs need only basic DevTools skills — no reverse engineering. Final code words are TBD and must be kept **server-side only**.

### 4.5 UX rules
- **Accessible:** every visual bug is a real `<button>` with an `aria-label`; fully keyboard and screen-reader playable.
- **Unobtrusive:** bugs are small and never cover content. A **"Hide bugs"** toggle exists for readers.
- **Reduced motion:** honour `prefers-reduced-motion` (no crawling/squash animations).
- **Persistence:** found bugs stored in `localStorage` so progress survives navigation and reloads.
- **Mobile:** all visual bugs are tappable; hover-only bug (#3) also triggers on tap.

### 4.6 Data model (Redis)

```
hunt:session:{id}        HASH   { mode, startedAt, found: "1,4,7" }      TTL 24h
hunt:board:quick         ZSET   member = "{name}#{id}", score = timeMs
hunt:board:full          ZSET   member = "{name}#{id}", score = timeMs
hunt:sign:{id}           HASH   { name, message, mode, timeMs, createdAt }
```

### 4.7 API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/hunt/start` | Create session `{ mode }` → `{ sessionId }`, server-stamped start time |
| POST | `/api/hunt/catch` | `{ sessionId, bugId, code? }` → validates code (technical bugs) and records find |
| POST | `/api/hunt/hint` | `{ sessionId, bugId }` → returns hint, adds 15 s penalty |
| POST | `/api/hunt/finish` | `{ sessionId, name, message? }` → validates all found, writes leaderboard |
| GET | `/api/hunt/board?mode=quick\|full` | Top 50 entries |

### 4.8 Guardrails
- Code words validated **server-side**; never shipped in the JS bundle.
- Time computed from **server timestamps** only.
- Reject impossible times (e.g. Quick < 15 s, Full < 30 s — tune after playtesting).
- Rate limit all write routes per IP.
- Name: max 20 chars; message: max 80 chars; profanity filter.
- Admin route (protected by env secret) to delete entries.
- **Known ceiling:** a determined person can fake visual-bug catch calls. Acceptable for a portfolio; upgrade to signed per-bug tokens if abuse appears.

---

## 4b. Feature: Avatar Guide

An illustrated avatar (developer with glasses) stands in for a photo. **Its main job is to welcome visitors and show them around;** the bug is only a side gag.

- **Everywhere:** a full-body figure (150px wide on desktop, 120px under 1100px, 86px on mobile) standing on the right edge above the bug jar (`components/Guide.tsx`), inspired by the mascot on joshwcomeau.com. Idle bob, blinking, head tilt and arm sway.
- **Moves between pages:** each route has its own spot (`SPOTS`). On navigation the guide slides there with a hop (squash and stretch) and a few walking steps. Coming back from another browser tab plays the same hop plus "Oh hey, welcome back!".
- **Speech dialog:** a card to the left of the avatar with a name label and close button. Text types out letter by letter; screen readers get the full line at once.
- **Welcome:** about 0.7s after arrival it greets by time of day ("Good evening! I'm Sajjad 👋 Welcome…"). Returning visitors get "Welcome back, it's great to see you again".
- **Tour tips:** at the bottom of each page it suggests where to go next, with a button (Home → About → Projects → Hall of Debuggers; case study → all projects; others → Home). Clicking the avatar gives navigation tips.
- **Narration:** any element with `data-guide="…"` makes the avatar say that line when the section reaches the middle of the screen. Clicking the avatar gives a random tip.
- **Vs. the bug (side gag):** the bug mostly creeps along the screen edges and sits still a lot. It climbs onto the guide's hoodie at most once every 25s (15% chance per move). When it does, he swats it (shocked face + arm swing) and it scurries off. He asks "Squash it for me sometime?" **once per page load**, with a button that opens the Bug Hunt; after that a quiet "Shoo" at most every 40s. Bug lines never interrupt a tour line. He says "Bug fixed! You're a real debugger" when it's squashed. His head position is shared via `crawlerBus.homeX/homeY`.
- **About page:** a large version of the avatar (`components/AvatarArt.tsx`) replaces the photo. `site.photo` stays empty unless a real photo is wanted later.
- Shared state between the bug and the guide lives in `components/hunt/crawlerBus.ts`.

---

## 5. Feature: Articles (Josh Comeau–inspired)

### 5.1 Typography & visual style
- Body: **Outfit** or **Plus Jakarta Sans**; code: **JetBrains Mono**; loaded via `next/font`.
- Comfortable reading width (~65ch), generous line height, clear heading scale.
- Light / dark theme with CSS variables; no flash on load (inline theme script).

### 5.2 Interactive MDX components
- `<Slider>` / `<Toggle>` — tweak a value, see the result live
- `<BeforeAfter>` — compare two states
- `<Playground>` — Sandpack live code editor
- `<Diagram>` — annotated SVG diagrams
- `<Callout>` — info / warning / tip boxes
- `<Newsletter />` — inline subscribe form

### 5.3 Subtle animations
- Like / heart button with spring bounce (count stored in Redis)
- Card hover lift on article index
- Reading progress bar
- Table of contents with active-section highlight
- All animations respect `prefers-reduced-motion`

### 5.4 Content features
- Tags + tag filter on `/articles`
- Reading time estimate
- RSS feed (`/rss.xml`)
- Auto-generated OG images per article
- Frontmatter: `title, description, date, tags, draft, cover`

---

## 6. Feature: Newsletter

### 6.1 Concept
An email newsletter where **each issue covers one new topic** (e.g. "CSS container queries", "How I debug React re-renders").

### 6.2 Implementation
- Subscribe form on `/newsletter`, home page, and at the end of every article.
- Form → `POST /api/newsletter/subscribe` → Buttondown API (**double opt-in**).
- Issues written in Buttondown's Markdown editor.
- `/newsletter` archive fetched from Buttondown API at build time (ISR revalidate daily) — no duplicate storage.
- Unsubscribe, bounces, and compliance handled by Buttondown.

### 6.3 Later (optional)
- GitHub Action that drafts a newsletter issue when a new article is merged.

---

## 7. Project Structure

```
portfolio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Home
│   ├── about/page.tsx
│   ├── projects/[slug]/page.tsx
│   ├── articles/page.tsx
│   ├── articles/[slug]/page.tsx
│   ├── newsletter/page.tsx
│   ├── hall-of-debuggers/page.tsx
│   ├── bug-hideout/page.tsx
│   ├── rss.xml/route.ts
│   ├── robots.ts
│   └── api/
│       ├── hunt/{start,catch,hint,finish,board}/route.ts
│       ├── likes/route.ts
│       └── newsletter/subscribe/route.ts
├── components/
│   ├── bug-hunt/                     # Jar, Bug, HuntPanel, useHunt hook
│   ├── mdx/                          # Slider, Playground, Callout, ...
│   └── ui/                           # Header, Footer, ThemeToggle, Card
├── content/
│   ├── articles/*.mdx
│   └── projects/*.mdx
├── lib/
│   ├── redis.ts
│   ├── hunt.ts                       # bug definitions (ids, hints) — codes in env
│   └── content.ts                    # MDX loading
├── public/
└── PLAN.md
```

### Environment variables
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
BUTTONDOWN_API_KEY=
HUNT_CODES=            # JSON map of technical bugId -> code word
ADMIN_SECRET=
```

---

## 8. Build Steps (Roadmap)

We build the site **step by step**. Each step ends with a working, deployed site so progress is always visible. A step starts only when the previous one is done.

| Step | Focus | Effort |
|---|---|---|
| **1** | Initial layout & design system | ~1 week |
| **2** | Content about me: bio, experience, projects | ~1 week |
| **3** | Bug Hunt game + Hall of Debuggers | ~1.5 weeks |
| **4** | Newsletter | ~3–4 days |
| **5** | Articles (after the core four, see note) | ~1–2 weeks |

**Total:** ~5–6 weeks part-time.

> Note: articles were not in the 4-step order. They sit as **Step 5**. Step 1 still reserves the `/articles` route and nav link so nothing needs restructuring later.

---

### Step 1 — Initial Layout & Design

**Goal:** a deployed skeleton site with the final look and feel, filled with placeholder content.

> **Status (2026-10-17): built locally, not yet deployed.**
> - Done: Next.js 16 scaffold, design tokens, light/dark theme with no flash, Header (+ mobile menu), Footer, all page shells, 404, robots, sitemap, icon. Build + lint pass.
> - Changed: motion uses plain CSS transitions/keyframes; the **Motion** library is deferred until a feature needs springs (Step 3 bug animations).
> - Changed: placeholder data lives in `lib/site.ts`; Step 2 decides whether projects move to MDX.
> - Still to do: Prettier / `.editorconfig` / `.nvmrc`, push to GitHub, connect Vercel, Lighthouse check.

#### 1.1 Project setup
- [ ] `npx create-next-app@latest` — TypeScript, App Router, ESLint, `src/` off
- [ ] Prettier config, `.editorconfig`, `.nvmrc`
- [ ] Git repo + push to GitHub
- [ ] Connect repo to Vercel — every push to `main` deploys, every PR gets a preview URL

#### 1.2 Design system
- [ ] **Colour tokens** as CSS variables on `:root` — background, surface, text, muted text, primary, accent, border
- [ ] **Dark theme** — same tokens redefined under `[data-theme="dark"]`
- [ ] **Theme toggle** — respects `prefers-color-scheme`, saves choice in `localStorage`, inline script in `<head>` to avoid flash
- [ ] **Typography** — body font (Outfit or Plus Jakarta Sans) + JetBrains Mono via `next/font`; type scale (h1–h6, body, small) using `clamp()` for fluid sizes
- [ ] **Spacing scale** — 4px-based tokens (`--space-1` … `--space-12`)
- [ ] **Radius, shadow and motion tokens** — standard durations and easings, reduced to 0 under `prefers-reduced-motion`
- [ ] **Breakpoints** — mobile-first: 640 / 960 / 1280 px

#### 1.3 Layout components
- [ ] `Header` — logo/name, nav (Home, About, Projects, Articles, Newsletter), theme toggle, mobile menu
- [ ] `Footer` — social links (GitHub, LinkedIn, email), copyright, RSS link placeholder
- [ ] `Container` — max width + 16px mobile gutter
- [ ] `Button`, `Link`, `Card`, `Tag`, `Section` primitives
- [ ] Skip-to-content link, visible focus rings

#### 1.4 Page shells (placeholder content)
- [ ] `/` Home — hero, short intro, featured projects strip, CTA area
- [ ] `/about` — bio block, experience timeline layout
- [ ] `/projects` — card grid
- [ ] `/projects/[slug]` — case study template
- [ ] `/articles`, `/newsletter` — "Coming soon" shells
- [ ] Custom `404` page

#### 1.5 Motion basics
- [ ] Install Motion
- [ ] Page fade-in, card hover lift, nav underline animation
- [ ] All disabled under `prefers-reduced-motion`

#### 1.6 SEO baseline
- [ ] `metadata` in root layout (title template, description)
- [ ] Favicon + app icons
- [ ] `robots.ts` and `sitemap.ts`

**Deliverable:** live Vercel URL with the full layout in light and dark themes.

**Done when:**
- [ ] Every page renders on mobile (375px) and desktop with no horizontal scroll
- [ ] Theme toggle works with no flash on reload
- [ ] Lighthouse Accessibility ≥ 95

---

### Step 2 — Content About Me

**Goal:** replace every placeholder with real information. After this step the site is already a usable portfolio.

> **Status (2026-10-17): real content filled from the résumé.**
> - Filled: bio, skills (5 groups), experience (2 roles), 2 projects (VideoStreamProxySimulator, ChatSphere) with GitHub links, LPU education, email, GitHub and LinkedIn. The phone number is deliberately left off the public site.
> - Project year/role are now optional (not in the résumé).
> - Photo replaced by an illustrated avatar guide (see 4b). Still missing: `public/resume.pdf`, project screenshots, real domain.
> - Done: Prettier, `.editorconfig`, `.nvmrc` (Step 1 leftovers). Content model in `lib/site.ts`: bio, "currently", skills, projects (year, role, problem/approach/result, cover, links), experience, education. Home skills strip and optional résumé button. About page: photo (`next/image`), "currently" block, timeline that reveals on scroll (native CSS scroll-driven animation), skills grid, education. Projects tag filter. Case-study meta and links. OG images for the site and each project (`next/og`).
> - Changed: projects stay in typed `lib/site.ts` instead of MDX. Three text fields per case study don't need an MDX pipeline. Revisit if case studies need rich layouts.
> - Still to do: fill every `TODO` in `lib/site.ts`, add `public/me.jpg`, `public/resume.pdf` and project screenshots in `public/projects/`, then run the "Done when" checks.

#### 2.1 Content gathering (before coding)
- [ ] Short bio (2–3 sentences for Home) and long bio (About page)
- [ ] Professional photo
- [ ] Experience list: company, role, dates, location, 3–4 achievement bullets each (use numbers where possible)
- [ ] Skills grouped: Languages, Frontend, Backend, Tools, Cloud
- [ ] 3–6 projects, each with: title, one-line summary, problem, my role, stack, outcome, screenshots, live link, GitHub link
- [ ] Résumé PDF
- [ ] Education and certifications (optional)

#### 2.2 Content storage
- [ ] `content/experience.ts` — typed array of roles
- [ ] `content/skills.ts` — grouped skills
- [ ] `content/projects/*.mdx` — one file per project; frontmatter: `title, summary, stack, cover, liveUrl, repoUrl, featured, order`
- [ ] `lib/content.ts` — load and sort projects

#### 2.3 Home page
- [ ] Hero: name, role ("Frontend / Fullstack Developer"), short bio, photo, CTA buttons (View Projects, Download Résumé)
- [ ] Featured projects (from `featured: true`)
- [ ] Short skills strip
- [ ] Contact CTA

#### 2.4 About page
- [ ] Long bio + photo
- [ ] **Experience timeline** — vertical timeline, animated reveal on scroll
- [ ] Skills grid with icons
- [ ] Education / certifications
- [ ] Résumé download button
- [ ] "Currently" block (what I'm learning / building)

#### 2.5 Projects
- [ ] `/projects` grid with filter by tech tag
- [ ] `/projects/[slug]` case study: cover, overview, problem → approach → result, stack tags, screenshot gallery, links
- [ ] Next / previous project navigation
- [ ] OG image per project via `next/og`

#### 2.6 Contact
- [ ] `mailto:` link + social links (no contact form, avoids spam handling)

**Deliverable:** a complete, shareable portfolio with real content.

**Done when:**
- [ ] No placeholder text remains (`grep -ri "lorem"` returns nothing)
- [ ] All project links and the résumé download work
- [ ] Shared links show the correct OG preview (LinkedIn / Slack)
- [ ] Reviewed by one non-technical person for clarity

---

### Step 3 — Bug Hunt Game

**Goal:** add the Bug Hunt and Hall of Debuggers (full spec in [Section 4](#4-feature-bug-hunt-the-game)).

> **Status (2026-10-17): built and played end to end locally (Full Hunt).**
> - Done: all 10 bugs placed, jar + native `<dialog>` panel, hints with penalty, code-word entry, squash + fly-to-jar animation (Web Animations API), "Hide bugs" toggle, progress kept in `localStorage`, Hall of Debuggers (live, `connection()` + Suspense), `/bug-hideout`, robots clue, `X-Bug` header, admin delete, rate limit, minimum-time and name checks. Code words and hints confirmed absent from `.next/static`.
> - Changed: no `@upstash/redis` / `@upstash/ratelimit` packages. `lib/store.ts` calls the Upstash REST API with `fetch` and falls back to an in-memory store when env vars are missing (dev only). Rate limiting is INCR + EXPIRE.
> - Changed: one route `app/api/hunt/route.ts` (POST `{action}` / GET / DELETE) instead of five route files.
> - Changed: bug #7 (console) is caught by calling `catchBug()` directly, with no code word. Bug #3 peeks over the top of the photo (a side peek caused horizontal scroll on mobile).
> - Changed: Motion library still not needed.
> - Still to do: create the Upstash database and set env vars on Vercel (see `.env.example`), playtest with one non-technical and one technical person, keyboard-only pass.

#### 3.1 Backend setup
- [ ] Create Upstash Redis database; add env vars to Vercel and `.env.local`
- [ ] `lib/redis.ts` client
- [ ] `lib/hunt.ts` — bug definitions (id, type, page, hint); code words read from `HUNT_CODES` env var only
- [ ] `@upstash/ratelimit` helper

#### 3.2 API routes
- [ ] `POST /api/hunt/start` — create session with server timestamp
- [ ] `POST /api/hunt/catch` — record find; validate code for technical bugs
- [ ] `POST /api/hunt/hint` — return hint, add 15 s penalty
- [ ] `POST /api/hunt/finish` — verify all bugs for the mode are found, check minimum time, profanity filter, write to leaderboard
- [ ] `GET /api/hunt/board` — top 50 per mode
- [ ] `DELETE /api/hunt/admin` — remove an entry (requires `ADMIN_SECRET`)

#### 3.3 Game UI
- [ ] `useHunt` hook — state (mode, found bugs, start time) synced with `localStorage` and API
- [ ] **Bug jar** — fixed corner button, progress badge (`🐛 3/6`)
- [ ] **Hunt panel** — mode select, Start, timer, found list, hint buttons, code-word input
- [ ] `<Bug id="…">` component — accessible `<button>`, squash + fly-to-jar animation
- [ ] "Hide bugs" toggle

#### 3.4 Place the bugs
Visual (Quick + Full):
- [x] #1 Pixel-art software bug crawling around the avatar (freezes near the pointer, 50px squash radius, "✓ fixed" badge). Replaced the fly, then the comet
- [ ] #2 Bio typo on About
- [ ] #3 Bug peeking behind photo on hover / tap
- [ ] #4 Ladybug sticker on a project thumbnail
- [x] #5 Glow bug visible only in dark mode (still, no floating; replaced the drifting firefly)
- [ ] #6 Sleeping bug in footer

Technical (Full only):
- [ ] #7 Console message + `window.catchBug()`
- [ ] #8 HTML comment with code in page source
- [ ] #9 `Disallow: /bug-hideout` in `robots.txt` + `/bug-hideout` page
- [ ] #10 `X-Bug` response header on an API route

#### 3.5 Hall of Debuggers
- [ ] `/hall-of-debuggers` page — tabs for Quick / Full, rank, name, time, message, date
- [ ] Finish screen — name + message form, then show the visitor's rank
- [ ] Bug Hunt teaser card on Home

**Deliverable:** both modes playable end to end with live leaderboards.

**Done when:**
- [ ] A non-technical tester finishes Quick Hunt without help (hints allowed)
- [ ] A developer tester finishes Full Hunt
- [ ] Code words are absent from the client bundle (`grep` the `.next` build output)
- [ ] Rate limits and minimum-time checks reject fake submissions
- [ ] Game fully playable by keyboard; animations off under reduced motion

---

### Step 4 — Newsletter

**Goal:** visitors can subscribe; one topic per issue; past issues archived on the site (full spec in [Section 6](#6-feature-newsletter)).

#### 4.1 Setup
- [ ] Create Buttondown account; set newsletter name, description, sender name
- [ ] Enable double opt-in; customise confirmation and welcome emails
- [ ] Add `BUTTONDOWN_API_KEY` to Vercel and `.env.local`
- [ ] (Optional) custom sending domain with SPF/DKIM for deliverability

#### 4.2 Subscribe flow
- [ ] `POST /api/newsletter/subscribe` — validate email, rate limit, forward to Buttondown
- [ ] `<NewsletterForm />` component — email input, submit, loading / success / error states, success animation
- [ ] Place the form on: Home, `/newsletter`, footer

#### 4.3 Newsletter page
- [ ] `/newsletter` — pitch (what you get, how often), form, past-issue archive
- [ ] Archive fetched from Buttondown API, revalidated daily (ISR)
- [ ] `/newsletter/[slug]` — read a past issue on the site

#### 4.4 First issues
- [ ] Decide name and cadence (e.g. bi-weekly)
- [ ] Prepare a topic backlog (at least 6 topics)
- [ ] Write and send issue #1

**Deliverable:** a working subscribe flow and a public archive.

**Done when:**
- [ ] A test address receives the confirmation email, confirms, and appears in Buttondown
- [ ] The unsubscribe link works
- [ ] Issue #1 is sent and shows in the archive

---

### Step 5 — Articles (after the core four)

**Goal:** a Josh Comeau–inspired articles section (full spec in [Section 5](#5-feature-articles-josh-comeauinspired)).

- [ ] MDX pipeline + syntax highlighting (Shiki)
- [ ] Article layout: reading width, table of contents, reading progress bar, reading time
- [ ] Interactive components: `Slider`, `BeforeAfter`, `Playground` (Sandpack), `Diagram`, `Callout`
- [ ] Like button (Redis counter, rate limited)
- [ ] `/articles` index with tag filter
- [ ] RSS feed and OG images
- [ ] Inline `<NewsletterForm />` at the end of each article
- [ ] Publish first 2 articles

---

### Final — Launch Polish
Run after Step 4 (or Step 5) using the [Quality Checklist](#9-quality-checklist-before-launch): performance, accessibility audit, cross-browser QA, custom domain, analytics.

---

## 9. Quality Checklist (before launch)
- [ ] Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO
- [ ] Full keyboard navigation, including Bug Hunt
- [ ] `prefers-reduced-motion` respected everywhere
- [ ] Works on iOS Safari, Android Chrome, desktop Chrome / Firefox / Safari
- [ ] Bug Hunt playtested by one non-technical and one technical person
- [ ] Code words absent from client bundle (`grep` the build output)
- [ ] Rate limits verified on all write routes
- [ ] Newsletter double opt-in + unsubscribe tested

---

## 9b. Writing Style

All visitor-facing copy (pages, case studies, guide lines, Bug Hunt panel, hints, error messages) follows these rules:

- **Precise and factual.** Every claim traces back to the résumé. Numbers are kept exactly (50%, 40%, 25%, 90%+). Nothing is inflated.
- **Experienced voice.** Short declarative sentences, active verbs, no filler ("passionate", "lifelong learner"), at most one exclamation mark.
- **Minimal emoji.** No emoji in professional copy. A few in the Bug Hunt UI only.
- **No employer or product names in the bio.** The employer appears only in the Experience section, as **TiVo** with a small mark (`components/CompanyLogo.tsx`, drawn in currentColor; swap in an official logo file if preferred). The product is referred to as "a streaming application for the living room" or "a next-generation streaming experience for the big screen".
- **A little humour, sparingly:** the "This site has bugs. On purpose." band, one line at the end of the About bio, the 404 page, the bug hideout, and one hint.
- **The guide is polite and brief:** it greets by time of day, describes sections in a sentence, and suggests a next page.

---

## 10. Open Decisions
- [ ] Domain name
- [x] Final font pick: Bricolage Grotesque (headings) + Plus Jakarta Sans (body) + Caveat (accent) + JetBrains Mono (code)
- [x] Brand colour palette (joshwcomeau.com palette)
- [ ] Final code words for technical bugs
- [ ] Newsletter name and sending cadence (e.g. bi-weekly)
- [ ] First 3 article topics

---

## 11. Decision Log

| Date | Decision | Why |
|---|---|---|
| 2026-10-17 | Next.js + MDX + Vercel | Interactive articles + API routes in one deploy |
| 2026-10-17 | ~~3D racing game~~ → **Bug Hunt** | Avoid copying Bruno Simon; game drives portfolio exploration; ~1 week vs ~3 weeks |
| 2026-10-17 | Two Bug Hunt modes (Quick / Full) | Non-technical visitors (HR) can finish; developers get DevTools challenges |
| 2026-10-17 | Upstash Redis for game data | Sorted sets fit leaderboards exactly; free tier |
| 2026-10-17 | Buttondown for newsletter | Don't build email infra; compliance handled |
| 2026-10-17 | Free fonts instead of Wotfard | Josh Comeau's font is commercially licensed |
| 2026-10-17 | Build order: Layout → About/Experience/Projects → Bug Hunt → Newsletter → Articles | Ship a usable portfolio early; each step ends deployed |
| 2026-10-17 | Theme and fonts match joshwcomeau.com | Requested by owner; Wotfard and Cartograph are paid, so Figtree and JetBrains Mono stand in. Sriracha is free |
| 2026-10-17 | Fonts changed to Bricolage Grotesque + Plus Jakarta Sans + Caveat | Cleaner and easier to read than Figtree; headings keep some character. Josh Comeau colour palette kept |
| 2026-10-17 | Copy rewritten for a professional, experienced tone | Precise, résumé-backed claims; emoji removed from professional copy; humour limited to a few deliberate spots (see 9b) |
| 2026-10-17 | Employer shown as TiVo (with logo) only in Experience; product name aliased | Owner preference: no company or internal product names in the bio |

---

## 12. Portfolio Projects Roadmap (systems-focused)

Six projects that show thinking beyond the frontend: architecture, concurrency, data correctness and stability. Each lives in **its own repository** and gets a case study on `/projects` once shipped. Unbuilt projects are **not** listed on the site.

### 12.1 Build order

| Order | Project | Core skill it proves | Effort |
|---|---|---|---|
| 1 | Observability-first URL shortener | Production-grade foundations: caching, tracing, SLOs, load tests | 2–3 weeks |
| 2 | Ticket-drop platform | Concurrency, contention, fairness under load | 3–4 weeks |
| 3 | Digital wallet with a ledger | Data correctness, idempotency, sagas | 3 weeks |
| 4 | Edge-cached streaming platform | Async pipelines, storage, CDN caching, adaptive streaming | 4–6 weeks |
| 5 | Real-time multiplayer game | Low-latency networking, authoritative servers | 4 weeks |
| 6 | Personal cloud drive | Large-file handling, dedup, sync and consistency | 4–5 weeks |

**Why this order:** the URL shortener is the smallest, and it produces a reusable template (below) that the others build on. Projects 2–3 are the strongest interview material. Project 4 is the flagship and closest to day-job expertise.

### 12.2 Shared foundation (built once in project 1, reused)
- Monorepo template: TypeScript (Node/Fastify or NestJS), Postgres, Redis, Docker Compose for local dev
- OpenTelemetry tracing + Prometheus metrics + Grafana dashboard
- k6 load-test scripts with results committed to the repo
- GitHub Actions CI (lint, test, build, image push)
- One-command deploy (Fly.io or Railway), with a seeded live demo
- README template: architecture diagram, trade-offs, failure modes, load-test results, "at 10× scale"

### 12.3 Projects

#### 1. Observability-first URL shortener
- **Pitch:** a deliberately simple product built like a production system.
- **MVP:** create short links (custom alias optional), redirect, per-link click stats, expiring links.
- **Architecture:** API → Postgres (source of truth) + Redis read-through cache → async click-event queue → aggregation worker. ID generation via base62 counter blocks to avoid hot rows.
- **Hard problems:** cache stampede on viral links, write amplification from click tracking, hot-key handling.
- **Demo moment:** public status page with p95 latency, cache hit rate, error budget, and the latest k6 report.
- **Case study angle:** how a 50-line idea becomes a system with SLOs.

#### 2. Ticket-drop platform
- **Pitch:** tickets go on sale at a set time, thousands click at once, nobody is double-booked.
- **MVP:** event with a seat map, virtual waiting room, seat hold with expiry, checkout (mock payment), confirmation email.
- **Architecture:** waiting-room service (token queue in Redis) → seat service (Redis locks with TTL + Postgres optimistic concurrency) → idempotent checkout → outbox → notification worker.
- **Hard problems:** race conditions on the same seat, fair admission, hold expiry and release, retry without double charge.
- **Demo moment:** "Simulate drop" button launches thousands of bots, with live counters showing zero double-bookings.
- **Case study angle:** correctness under contention.

#### 3. Digital wallet with a proper ledger
- **Pitch:** top up, send money between users, split bills; money is never created or lost.
- **MVP:** accounts, double-entry ledger, transfers, transaction history, idempotency keys on every write.
- **Architecture:** ledger service (append-only entries, balances derived) → transfer saga (reserve → post → settle, with compensations) → outbox for events → reconciliation job.
- **Hard problems:** crash mid-transfer, duplicate requests, concurrent transfers from the same account.
- **Demo moment:** "Crash the server mid-transfer" toggle, then a reconciliation report showing the books still balance.
- **Case study angle:** designing for correctness first.

#### 4. Edge-cached streaming platform (flagship)
- **Pitch:** a mini Netflix: upload a video, it's transcoded and streamed with adaptive bitrate through an edge cache.
- **MVP:** upload, transcode to HLS (3 renditions), catalogue page, player with ABR, resume where you left off.
- **Architecture:** upload API (pre-signed multipart to S3/MinIO) → job queue (BullMQ) → FFmpeg workers (horizontally scalable) → object storage → Nginx edge cache → player. Metadata in Postgres.
- **Hard problems:** long-running jobs and retries, cache invalidation for new renditions, worker crash recovery, startup time.
- **Demo moment:** kill a transcode worker mid-job and watch another pick it up. A TV-friendly 10-foot UI to browse the catalogue.
- **Case study angle:** the full video pipeline, end to end. Pairs with VideoStreamProxySimulator.

#### 5. Real-time multiplayer game
- **Pitch:** a small competitive browser game with matchmaking and rooms.
- **MVP:** matchmaking queue, 2–8 player rooms, authoritative server tick loop, leaderboard.
- **Architecture:** matchmaker → room servers (WebSocket, fixed tick rate) with client-side prediction and server reconciliation → Redis for room registry → Postgres for results.
- **Hard problems:** latency hiding, cheating prevention (server is the source of truth), reconnects, scaling rooms across instances.
- **Demo moment:** a latency slider to show prediction and reconciliation in action.
- **Case study angle:** networking under real-world latency.

#### 6. Personal cloud drive
- **Pitch:** upload, sync and share files across devices.
- **MVP:** chunked resumable uploads, folders, share links with expiry, a basic desktop or browser sync client.
- **Architecture:** upload service (content-addressed chunks, SHA-256) → object storage with chunk dedup → metadata service (Postgres) → change feed (cursor-based) for sync clients → signed URLs for sharing.
- **Hard problems:** resume after network loss, dedup across users, concurrent edits (conflict copies), storage efficiency.
- **Demo moment:** pull the network cable mid-upload of a large file, plug it back in, and the upload resumes from where it stopped.
- **Case study angle:** reliability for large files on unreliable networks.

### 12.4 Case-study template (extend when the first project ships)
Add two sections to `/projects/[slug]` after Approach: **Architecture** (diagram + components) and **Trade-offs & failure modes**. Add optional `metrics` to the `Project` type for load-test results.
