# Contributing to TalkCut

TalkCut is a browser-based, transcript-driven video editor. All processing runs locally; no server, cloud API, or telemetry is permitted in the core application.

## Development Setup

```bash
git clone https://github.com/xzabir/talkcut.git
cd talkcut
npm install
npm run typecheck
npm run test
npm run dev
```

Open Chrome or Edge at `http://localhost:5173`. The dev server supports hot module replacement for TypeScript and CSS.

### Prerequisites

- Node.js 20 or later
- Chrome or Edge for testing export; transcription and editing work in any modern browser
- No additional SDK, toolchain, or API key is required

### Build and Test

```bash
npm run typecheck  # TypeScript --noEmit
npm run test       # Vitest unit tests
npm run build      # TypeScript check + Vite production build → dist/
npm run preview    # Serve the production build locally
```

## Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the high-level design, data flow, and source file responsibilities.

## Pull Request Guidelines

1. **Keep changes focused.** One feature or fix per PR is preferred.
2. **No external API dependencies.** Core processing must remain local to the browser. Do not add server-side components, cloud APIs, telemetry, or analytics.
3. **Feature-detect browser APIs.** Provide graceful fallbacks where possible. Export requires WebCodecs; editing and transcription should degrade on unsupported browsers.
4. **Follow existing conventions.** This is vanilla TypeScript. DOM manipulation is direct. Use CSS custom properties from `src/style.css` for theming.
5. **Add or update tests.** If your change includes pure logic, add a unit test in `tests/`. Browser-dependent changes must be described with manual test steps in the PR.
6. **Update documentation.** If the change affects user-facing behavior, update `README.md`, `CHANGELOG.md`, or `docs/ARCHITECTURE.md` as appropriate.
7. **Ensure a clean build.** `npm run typecheck`, `npm run test`, and `npm run build` must all pass before requesting review.

## Commit Messages

Use concise, descriptive commit messages in the imperative mood:

- `feat: add silence threshold slider to cuts panel`
- `fix: preserve A/V sync across multiple cut regions`
- `docs: update export compatibility notes`
- `test: add CutManager undo/redo cases`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
