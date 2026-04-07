# Manual QA checklist

Use this checklist against the current integrated baseline.

Scope of the visible UI today:

- overlay injection
- toolbar rendering
- feedback mode toggle
- hover target selection
- annotation popover and save flow
- `Escape` handling

Not yet exposed in the UI on this branch:

- persistence after refresh
- export buttons / clipboard flow
- annotation markers, list management, delete, reorder
- extra shortcuts beyond `Escape`

## 1. Setup

- [ ] Run `npm install` successfully.
- [ ] Run `npm run dev` successfully.
- [ ] Confirm the dev build exists at `build/chrome-mv3-dev`.
- [ ] Start a local frontend page to annotate, such as `http://localhost:3000`.

## 2. Load the unpacked extension

- [ ] Open `chrome://extensions`.
- [ ] Enable **Developer mode**.
- [ ] Click **Load unpacked** and select `build/chrome-mv3-dev`.
- [ ] Confirm the AgentUI extension card loads without manifest errors.
- [ ] Click the pinned AgentUI extension button once and confirm the overlay shows on the current tab.
- [ ] Click it again and confirm the overlay hides on the current tab.

## 3. Smoke test on a local page

- [ ] Open the local test page.
- [ ] Confirm the AgentUI toolbar is hidden by default.
- [ ] Click the pinned AgentUI extension button.
- [ ] Confirm the AgentUI toolbar renders in the top-right corner.
- [ ] Confirm the toolbar status starts in the `Feedback mode off` state.
- [ ] Confirm the note count starts at `0 notes` on a fresh page load.

## 4. Annotation capture flow

- [ ] Click **Start annotating**.
- [ ] Move the pointer over visible page elements.
- [ ] Confirm a hover outline follows the current target.
- [ ] Click a target element.
- [ ] Confirm the annotation popover opens near the selected element.
- [ ] Confirm the Save button stays disabled until feedback text is entered.
- [ ] Enter feedback text.
- [ ] Optionally choose a tag.
- [ ] Click **Save**.
- [ ] Confirm the popover closes.
- [ ] Confirm the toolbar note count increments.

## 5. Cancel / exit behavior

- [ ] Open the popover on a target.
- [ ] Click **Cancel**.
- [ ] Confirm the popover closes without saving a note.
- [ ] Turn feedback mode on again if needed.
- [ ] Click **Stop annotating**.
- [ ] Confirm the hover outline disappears and normal page interaction resumes.

## 6. Keyboard behavior

`Escape` is the only shortcut currently implemented.

- [ ] With the popover open, press `Escape`.
- [ ] Confirm the popover closes.
- [ ] With feedback mode still on and no popover open, press `Escape`.
- [ ] Confirm feedback mode turns off.

## 7. Expected current limitations

These checks help confirm the docs still match the shipped baseline.

- [ ] Reload the page and confirm notes do **not** persist yet.
- [ ] Confirm the toolbar still shows a disabled `Export soon` button.
- [ ] Confirm there is no visible annotation list, marker layer, delete action, or reorder UI.
- [ ] Confirm no other keyboard shortcuts are documented or implied by the UI.

## 8. Export reference

The export serializers already exist in code, but there is no visible export trigger yet.

- [ ] Compare the examples in `README.md` with the current formatter files:
  - `src/export/formatCompact.ts`
  - `src/export/formatDetailed.ts`
- [ ] Confirm the documented field names and ordering still match the implementation.

## 9. Record test evidence

Capture the following when you run this checklist:

- page URL tested
- browser version
- pass/fail notes
- any console or extension-card errors
