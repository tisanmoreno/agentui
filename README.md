# AgentUI

Minimal Plasmo-based browser extension foundation for AgentUI.

## Scripts

- `npm run dev` — start the Plasmo development build
- `npm run build` — create a production extension build
- `npm run package` — package the production build
- `npm run check-types` — run TypeScript type checks

## Current foundation

- Manifest V3 extension scaffold with TypeScript + React
- Content-script overlay shell injected on HTTP/HTTPS pages
- Visible in-page toolbar placeholder for future AgentUI actions
- Initial module boundaries for annotation state, selector utilities, storage utilities, and export serializers

## Project structure

```text
src/
  contents/
    agentui-overlay.tsx
  export/
    serializers.ts
  features/
    annotations/
      state.ts
      types.ts
  ui/
    overlay/
      OverlayShell.tsx
    toolbar/
      ToolbarPlaceholder.tsx
  utils/
    selectors.ts
    storage.ts
```
