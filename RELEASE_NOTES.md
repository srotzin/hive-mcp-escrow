# HiveEscrow MCP Server — v1.0.0

## Overview

Initial scaffold for `hive-mcp-escrow`. The MCP server is structurally complete: `tools/list`, `/health`, and `/.well-known/mcp.json` are operational. The hivemorph backend for this vertical is not yet built. All `tools/call` requests return HTTP 503 — no mock data, no simulated responses.

---

## Tools

| Tool | Description |
|---|---|
| `open_escrow` | Opens an escrow agreement between buyer and seller DIDs. Terms are stored as a hash on-chain. Returns `escrow_id`. Backend pending (Q3 2026). |
| `fund_escrow` | Funds an open escrow by submitting the on-chain transaction hash. USDC settlement via x402 on Base, Ethereum, or Solana. Backend pending (Q3 2026). |
| `release` | Releases escrowed funds to the seller upon delivery confirmation. Requires signer DID (buyer or designated arbiter). Backend pending (Q3 2026). |
| `dispute` | Opens a dispute on an active escrow. Routes to Hive arbiter assignment. Funds remain locked until resolution. Returns `arbiter_assignment`. Backend pending (Q3 2026). |

---

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/escrow/open` | Open A2A escrow (terms hashed on-chain) |
| `POST` | `/v1/escrow/{id}/fund` | Fund escrow via USDC/x402 |
| `POST` | `/v1/escrow/{id}/release` | Release funds to seller |
| `POST` | `/v1/escrow/{id}/dispute` | Dispute — arbiter assignment |

---

## Settlement

USDC on Base, Ethereum, or Solana via x402. No mock, no simulated settlement.

---

## Status

- **Backend:** v0.1 — pending hivemorph build (Q3 2026 spec)
- **Council:** R4
- **`tools/list`:** operational
- **`/health`:** operational
- **`/.well-known/mcp.json`:** operational
- **`tools/call`:** returns HTTP 503

```json
{
  "error": "feature gating: backend pending; submit interest at hive-mcp-connector",
  "backend_status": "v0.1 — pending hivemorph backend build (Q3 2026 spec)",
  "service": "hive-mcp-escrow",
  "interest_url": "https://hive-mcp-connector.thehiveryiq.com"
}
```

---

## Constraints

- No mock data, no simulated settlement at any point
- Brand gold: Pantone 1245 C / `#C08D23`
- No energy futures, GAS-PERP, GPU-PERP, or HASHRATE-PERP
- LLM calls route only through `https://hivecompute-g2g7.onrender.com/v1/compute/chat/completions`
- hivemorph remains private; this repository is the public surface
