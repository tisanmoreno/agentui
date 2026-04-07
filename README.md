# AgentUI

AgentUI is a lightweight Chrome extension for capturing UI feedback directly on a live page. The current baseline focuses on the in-page annotation flow: load the extension, turn on feedback mode, click an element, and save a tagged note that can later be exported into compact plain text for terminal or AI-assisted iteration workflows.

## Current baseline

What is working on this branch:

- Manifest V3 extension built with Plasmo, TypeScript, and React
- Content-script overlay injected on HTTP and HTTPS pages
- Floating toolbar with feedback mode toggle and live note count
- Hover outline for candidate elements while feedback mode is on
- Annotation popover for adding a tag and feedback text to the selected element
- Compact and detailed export formatters in `src/export/*`

What is **not** wired into the visible UI yet:

- Persisted annotations across page reloads
- Export buttons / clipboard actions in the toolbar
- Annotation list, markers, delete, and reorder controls
- Keyboard shortcuts beyond `Escape`

That means the best way to understand the product today is:

1. run the extension locally,
2. load it in Chrome,
3. capture feedback on a localhost page,
4. use the README export examples as the current serializer reference.

## Prerequisites

- Node.js and npm
- Google Chrome or another Chromium-based browser
- A local web page to test against, for example `http://localhost:3000`

This repo does not currently pin a Node version. The commands below were verified with:

- Node `v22.22.2`
- npm `11.12.1`

## Local setup

```bash
git clone git@github.com:tisanmoreno/agentui.git
cd agentui
npm install
```

Start the extension dev build:

```bash
npm run dev
```

`plasmo dev` watches for changes and writes the unpacked development build to:

```text
build/chrome-mv3-dev
```

In a separate terminal, run any local frontend you want to annotate. This repository does not include a demo app, so testing is done against an external local app such as:

```text
http://localhost:3000
```

## Load the unpacked extension in Chrome

1. Start the dev build with `npm run dev`.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select `build/chrome-mv3-dev`.
6. Confirm the **AgentUI** extension card appears without manifest errors.
7. Open your local page, such as `http://localhost:3000`.
8. Confirm the AgentUI overlay is hidden by default.
9. Click the pinned AgentUI extension button to show or hide the overlay on the current tab.

After code changes:

1. wait for `npm run dev` to rebuild,
2. click **Reload** on the AgentUI extension card,
3. refresh the page you are testing.

## Core workflow

### 1. Start annotating

Click the pinned AgentUI extension button to show the overlay on the current tab. Then click **Start annotating** in the toolbar.

### 2. Pick a target

Move your pointer over the page. AgentUI highlights the current candidate element with a blue outline.

### 3. Save feedback

Click the highlighted element to open the popover, then:

- optionally choose a tag,
- enter feedback text,
- click **Save**.

The toolbar note count increments after saving.

### 4. Exit or cancel

- Click **Stop annotating** to leave feedback mode.
- Press `Escape` to close the popover.
- Press `Escape` again while feedback mode is active to exit feedback mode.

## Export format reference

The current branch already includes compact and detailed serializers in `src/export/formatCompact.ts` and `src/export/formatDetailed.ts`, but the export action is not exposed in the toolbar yet. Use these examples as the reference output for future UI wiring and manual checks.

### Compact export example

```text
Frontend feedback

Page: http://localhost:3000/settings

1. [width] Settings hero section
   Context: "Simple pricing for modern teams"
   Feedback: Make this section wider on large screens.

2. [spacing] Save settings button
   Context: "Save changes"
   Feedback: Rename this to "Save settings" and add more space above it.
```

### Detailed export example

```text
Frontend feedback

Page: http://localhost:3000/settings

1. [width] Settings hero section
   Target: Settings hero section
   Selector: main section.hero
   Context: "Simple pricing for modern teams"
   Feedback: Make this section wider on large screens.

2. [spacing] Save settings button
   Target: Save settings button
   Selector: form button[type="submit"]
   Context: "Save changes"
   Feedback: Rename this to "Save settings" and add more space above it.
```

## Scripts

- `npm run dev` — start the Plasmo development build in watch mode
- `npm run build` — create a production build in `build/chrome-mv3-prod`
- `npm run package` — create `build/chrome-mv3-prod.zip`
- `npm run check-types` — run TypeScript type checks

## Manual QA

Use [`docs/manual-qa.md`](docs/manual-qa.md) before merging UI changes or updating the onboarding flow.

## Troubleshooting

- **No toolbar on the page**: AgentUI starts hidden by default. Click the pinned AgentUI extension button first. If it still does not appear, make sure the extension is loaded from `build/chrome-mv3-dev`, then reload the extension card and refresh the page.
- **Wrong folder selected in Chrome**: choose the generated build folder, not the repo root.
- **No local page to test with**: start any frontend separately and use its localhost URL.
- **Clicking the page does nothing**: make sure feedback mode is on before selecting a target.
- **Expected export buttons are missing**: that is the current baseline; only the formatter utilities exist on this branch.
