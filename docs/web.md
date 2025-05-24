# Web interface

This repository includes a small demo web server that exposes the Codex agent over WebSockets.

## Prerequisites

- Node.js 22 or newer
- `pnpm` (see [PNPM.md](../PNPM.md))

## Usage

1. Install dependencies and build the CLI (only needed once):
   ```bash
   pnpm install
   pnpm build
   ```
2. Start the web server:
   ```bash
   pnpm web
   ```
3. Open <http://localhost:3000> in your browser and start sending prompts.

The HTML UI lives in [`web/public/index.html`](../web/public/index.html). Feel free to tweak it for your needs.
