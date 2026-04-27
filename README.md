# HiveEscrow

**Agent-to-agent escrow with x402/USDC settlement, dispute resolution, and on-chain arbiter assignment**

`hive-mcp-escrow` is an MCP server for the Hive Escrow platform. Agents open escrow agreements between buyer and seller DIDs, fund them on-chain via USDC/x402 settlement on Base, Ethereum, or Solana, release funds upon delivery confirmation, and route disputes to an arbiter. Terms are hashed on-chain for auditability.

> **Backend status:** The hivemorph backend for this vertical is not yet built. All `tools/call` requests return HTTP 503 — no mock data is returned. Backend target: Q3 2026.

> Council R4 — staged for Q3 2026 backend build

---

## Backend Status

All `tools/call` requests return HTTP 503:
```json
{ "error": "feature gating: backend pending; submit interest at hive-mcp-connector" }
```
`tools/list`, `/health`, and `/.well-known/mcp.json` are operational and return the full tool catalog.
No mock data is returned at any point.

---

## Protocol

- **Spec:** MCP 2024-11-05 over Streamable-HTTP / JSON-RPC 2.0
- **Transport:** `POST /mcp`
- **Discovery:** `GET /.well-known/mcp.json`
- **Health:** `GET /health`
- **Settlement:** USDC on Base, Ethereum, Solana via x402 (real rails only)
- **Brand gold:** Pantone 1245 C / `#C08D23`
- **Tools:** 4

---

## Tools

| Tool | Description |
|---|---|
| `open_escrow` | Opens an escrow agreement between buyer and seller DIDs. Terms are stored as a hash on-chain. Returns `escrow_id`. Backend pending (Q3 2026). |
| `fund_escrow` | Funds an open escrow by submitting the on-chain transaction hash. USDC settlement via x402 on Base, Ethereum, or Solana. Backend pending (Q3 2026). |
| `release` | Releases escrowed funds to the seller upon delivery confirmation. Requires signer DID (buyer or designated arbiter). Backend pending (Q3 2026). |
| `dispute` | Opens a dispute on an active escrow. Routes to Hive arbiter assignment. Funds remain locked until resolution. Returns `arbiter_assignment`. Backend pending (Q3 2026). |

---

## Backend Endpoints (pending Q3 2026)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/escrow/open` | Open A2A escrow (terms hashed on-chain) |
| `POST` | `/v1/escrow/{id}/fund` | Fund escrow via USDC/x402 |
| `POST` | `/v1/escrow/{id}/release` | Release funds to seller |
| `POST` | `/v1/escrow/{id}/dispute` | Dispute — arbiter assignment |

---

## Run Locally

```bash
git clone https://github.com/srotzin/hive-mcp-escrow.git
cd hive-mcp-escrow
npm install
npm start
# Server on http://localhost:3000
# tools/list returns tool catalog; tools/call returns 503 (backend pending)
curl http://localhost:3000/health
curl http://localhost:3000/.well-known/mcp.json
curl -s -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .result.tools[].name
```

---

## Connect from an MCP Client

Add to your `mcp.json`:

```json
{
  "mcpServers": {
    "hive_mcp_escrow": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://your-deployed-host/mcp"]
    }
  }
}
```

---

## Hive Civilization

Part of the [Hive Civilization](https://www.thehiveryiq.com) — sovereign DID, USDC settlement, HAHS legal contracts, agent-to-agent rails.

## License

MIT (c) 2026 Steve Rotzin / Hive Civilization
