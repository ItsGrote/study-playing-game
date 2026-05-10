import { createServer } from "node:http";
import { WORKSPACE_NAME } from "@repo/shared";

const port = Number(process.env.PORT) || 4001;

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        service: "realtime",
        workspace: WORKSPACE_NAME,
      }),
    );
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
});

server.listen(port, () => {
  console.log(`[realtime] listening on http://localhost:${port}`);
});
