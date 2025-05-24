import 'ts-node/esm/transpile-only';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { loadConfig } from '../codex-cli/src/utils/config.ts';
import { AgentLoop } from '../codex-cli/src/utils/agent/agent-loop.ts';
import { AutoApprovalMode } from '../codex-cli/src/utils/auto-approval-mode.ts';
import { ReviewDecision } from '../codex-cli/src/utils/agent/review.ts';
import { createInputItem } from '../codex-cli/src/utils/input-utils.ts';

const app = express();
app.use(express.static(new URL('./public', import.meta.url).pathname));

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    try {
      const { prompt } = JSON.parse(data.toString());
      if (!prompt) return;
      const config = loadConfig();
      const agent = new AgentLoop({
        model: config.model,
        provider: config.provider ?? 'openai',
        instructions: config.instructions,
        config,
        approvalPolicy: AutoApprovalMode.FULL_AUTO,
        additionalWritableRoots: [],
        disableResponseStorage: config.disableResponseStorage,
        onItem: (item) => ws.send(JSON.stringify(item)),
        onLoading: (l) => ws.send(JSON.stringify({ type: 'loading', loading: l })),
        getCommandConfirmation: async () => ({ review: ReviewDecision.YES }),
        onLastResponseId: () => {},
      });
      const inputItem = await createInputItem(prompt, []);
      await agent.run([inputItem]);
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: String(err) }));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
