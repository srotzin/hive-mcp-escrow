#!/usr/bin/env node
/**
 * HiveEscrow MCP Server
 * Agent-to-agent escrow service with x402 settlement, dispute resolution, and arbiter assignment
 *
 * Backend  : https://hivemorph.onrender.com
 * Status   : v0.1 — pending hivemorph backend build (Q3 2026 spec)
 * Spec     : MCP 2024-11-05 / Streamable-HTTP / JSON-RPC 2.0
 * Brand    : Hive Civilization gold #C08D23 (Pantone 1245 C)
 *
 * RAILS RULE 1 — NO MOCK RESPONSES.
 * All tool calls return HTTP 503 until the backend is live.
 * Agents receive: { "error": "feature gating: backend pending; submit interest at hive-mcp-connector" }
 */

import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HIVE_BASE = process.env.HIVE_BASE || 'https://hivemorph.onrender.com';

// ─── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
    {
      name: 'open_escrow',
      description: 'Open an escrow agreement between buyer and seller DIDs. Terms are stored as a hash on-chain. Returns escrow_id. Backend pending (Q3 2026).',
      inputSchema: {
        type: 'object',
        required: ["buyer_did", "seller_did", "amount_usd", "terms_hash"],
properties: {
          buyer_did: { type: 'string', description: 'DID of the buyer agent' },
  seller_did: { type: 'string', description: 'DID of the seller agent' },
  amount_usd: { type: 'number', description: 'Escrow amount in USD' },
  terms_hash: { type: 'string', description: 'SHA-256 hash of the agreed terms document' }
        },
      },
    },    {
      name: 'fund_escrow',
      description: 'Fund an open escrow by submitting the on-chain transaction hash. USDC settlement via x402 on Base, Ethereum, or Solana. Backend pending (Q3 2026).',
      inputSchema: {
        type: 'object',
        required: ["escrow_id", "tx_hash"],
properties: {
          escrow_id: { type: 'string', description: 'Escrow ID from open_escrow' },
  tx_hash: { type: 'string', description: 'On-chain funding transaction hash' }
        },
      },
    },    {
      name: 'release',
      description: 'Release escrowed funds to the seller upon delivery confirmation. Requires signer DID (buyer or designated arbiter). Backend pending (Q3 2026).',
      inputSchema: {
        type: 'object',
        required: ["escrow_id", "signer_did"],
properties: {
          escrow_id: { type: 'string', description: 'Escrow ID to release' },
  signer_did: { type: 'string', description: 'DID of the releasing party (buyer or arbiter)' }
        },
      },
    },    {
      name: 'dispute',
      description: 'Open a dispute on an active escrow. Routes to Hive arbiter assignment. Funds remain locked until resolution. Returns arbiter_assignment. Backend pending (Q3 2026).',
      inputSchema: {
        type: 'object',
        required: ["escrow_id", "reason"],
properties: {
          escrow_id: { type: 'string', description: 'Escrow ID to dispute' },
  reason: { type: 'string', description: 'Reason for the dispute' }
        },
      },
    }
];

// ─── Feature-gate response (Rails Rule 1 — no mock) ──────────────────────────
function featureGate(res) {
  return res.status(503).json({
    error: 'feature gating: backend pending; submit interest at hive-mcp-connector',
    backend_status: 'v0.1 — pending hivemorph backend build (Q3 2026 spec)',
    service: 'hive-mcp-escrow',
    interest_url: 'https://hive-mcp-connector.thehiveryiq.com',
  });
}

// ─── MCP JSON-RPC handler ────────────────────────────────────────────────────
app.post('/mcp', async (req, res) => {
  const { jsonrpc, id, method, params } = req.body || {};
  if (jsonrpc !== '2.0') {
    return res.json({ jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid JSON-RPC' } });
  }
  try {
    switch (method) {
      case 'initialize':
        return res.json({ jsonrpc: '2.0', id, result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: { listChanged: false } },
          serverInfo: {
            name: 'hive-mcp-escrow',
            version: '1.0.0',
            description: 'Agent-to-agent escrow service with x402 settlement, dispute resolution, and arbiter assignment',
            backendStatus: 'v0.1 — pending hivemorph backend build (Q3 2026 spec)',
          },
        } });
      case 'tools/list':
        return res.json({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
      case 'tools/call':
        // Rails Rule 1: backend not yet live — return honest 503, no mock data.
        return featureGate(res);
      case 'ping':
        return res.json({ jsonrpc: '2.0', id, result: {} });
      default:
        return res.json({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
    }
  } catch (err) {
    return res.json({ jsonrpc: '2.0', id, error: { code: -32000, message: err.message } });
  }
});

// ─── Discovery + health ──────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'hive-mcp-escrow',
  version: '1.0.0',
  backend: HIVE_BASE,
  backendStatus: 'v0.1 — pending hivemorph backend build (Q3 2026 spec)',
  toolCount: TOOLS.length,
  brand: '#C08D23',
}));

app.get('/.well-known/mcp.json', (req, res) => res.json({
  name: 'hive-mcp-escrow',
  endpoint: '/mcp',
  transport: 'streamable-http',
  protocol: '2024-11-05',
  backendStatus: 'v0.1 — pending hivemorph backend build (Q3 2026 spec)',
  tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
}));

app.listen(PORT, () => {
  console.log('HiveEscrow MCP Server running on :' + PORT);
  console.log('  Backend : ' + HIVE_BASE);
  console.log('  Status  : v0.1 — pending hivemorph backend build (Q3 2026 spec)');
  console.log('  Tools   : ' + TOOLS.length + ' (open_escrow, fund_escrow, release, dispute)');
  console.log('  Rails   : tool calls return 503 until backend is live (no mock)');
});
