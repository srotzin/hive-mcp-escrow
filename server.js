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
import { renderLanding, renderRobots, renderSitemap, renderSecurity, renderOgImage, seoJson, BRAND_GOLD } from './meta.js';

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


const SERVICE_CFG = {
  service: "hive-mcp-escrow",
  shortName: "HiveEscrow",
  title: "HiveEscrow \u00b7 Multi-Party Agent Escrow & Settlement MCP",
  tagline: "Multi-party escrow with stake-weighted dispute routing for autonomous agents.",
  description: "MCP server for HiveEscrow \u2014 multi-party agent escrow and settlement on the Hive Civilization. Stake-weighted dispute routing, ZK-attested arbitration. USDC settlement on Base L2. Real rails, no mocks.",
  keywords: ["mcp", "model-context-protocol", "x402", "agentic", "ai-agent", "ai-agents", "llm", "hive", "hive-civilization", "escrow", "multi-party-escrow", "settlement", "dispute-routing", "arbitration", "usdc", "base", "base-l2", "agent-economy", "a2a"],
  externalUrl: "https://hive-mcp-escrow.onrender.com",
  gatewayMount: "/escrow",
  version: "1.0.1",
  pricing: [
    { name: "escrow_open", priceUsd: 0.05, label: "Open escrow (Tier 3)" },
    { name: "escrow_release", priceUsd: 0.005, label: "Release (Tier 2)" },
    { name: "escrow_dispute", priceUsd: 0.05, label: "Open dispute (Tier 3)" }
  ],
};
SERVICE_CFG.tools = (typeof TOOLS !== 'undefined' ? TOOLS : []).map(t => ({ name: t.name, description: t.description }));
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


// HIVE_META_BLOCK_v1 — comprehensive meta tags + JSON-LD + crawler discovery
app.get('/', (req, res) => {
  res.type('text/html; charset=utf-8').send(renderLanding(SERVICE_CFG));
});
app.get('/og.svg', (req, res) => {
  res.type('image/svg+xml').send(renderOgImage(SERVICE_CFG));
});
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(renderRobots(SERVICE_CFG));
});
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send(renderSitemap(SERVICE_CFG));
});
app.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain').send(renderSecurity());
});
app.get('/seo.json', (req, res) => res.json(seoJson(SERVICE_CFG)));

// ─── Schema discoverability ────────────────────────────────────────────────
const AGENT_CARD = {
  name: SERVICE,
  description: 'MCP server for HiveEscrow — agent-to-agent escrow with x402 settlement and dispute resolution. Open, fund, release, and dispute escrow agreements. USDC settlement on Base, Ethereum, or Solana. New agents: first call free. Loyalty: every 6th paid call is free. Pay in USDC on Base L2.',
  url: `https://${SERVICE}.onrender.com`,
  provider: {
    organization: 'Hive Civilization',
    url: 'https://www.thehiveryiq.com',
    contact: 'steve@thehiveryiq.com',
  },
  version: VERSION,
  capabilities: {
    streaming: false,
    pushNotifications: false,
    stateTransitionHistory: false,
  },
  authentication: {
    schemes: ['x402'],
    credentials: {
      type: 'x402',
      asset: 'USDC',
      network: 'base',
      asset_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      recipient: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
    },
  },
  defaultInputModes: ['application/json'],
  defaultOutputModes: ['application/json'],
  skills: [
    { name: 'open_escrow', description: 'Open an escrow agreement between buyer and seller DIDs. Terms are stored as a hash on-chain. Returns escrow_id. Backend pending (Q3 2026).' },
    { name: 'fund_escrow', description: 'Fund an open escrow by submitting the on-chain transaction hash. USDC settlement via x402 on Base, Ethereum, or Solana. Backend pending (Q3 2026).' },
    { name: 'release', description: 'Release escrowed funds to the seller upon delivery confirmation. Requires signer DID (buyer or designated arbiter). Backend pending (Q3 2026).' },
    { name: 'dispute', description: 'Open a dispute on an active escrow. Routes to Hive arbiter assignment. Funds remain locked until resolution. Returns arbiter_assignment. Backend pending (Q3 2026).' },
  ],
  extensions: {
    hive_pricing: {
      currency: 'USDC',
      network: 'base',
      model: 'per_call',
      first_call_free: true,
      loyalty_threshold: 6,
      loyalty_message: 'Every 6th paid call is free',
    },
  },
};

const AP2 = {
  ap2_version: '1',
  agent: {
    name: SERVICE,
    did: `did:web:${SERVICE}.onrender.com`,
    description: 'MCP server for HiveEscrow — agent-to-agent escrow with x402 settlement and dispute resolution. Open, fund, release, and dispute escrow agreements. USDC settlement on Base, Ethereum, or Solana. New agents: first call free. Loyalty: every 6th paid call is free. Pay in USDC on Base L2.',
  },
  endpoints: {
    mcp: `https://${SERVICE}.onrender.com/mcp`,
    agent_card: `https://${SERVICE}.onrender.com/.well-known/agent-card.json`,
  },
  payments: {
    schemes: ['x402'],
    primary: {
      scheme: 'x402',
      network: 'base',
      asset: 'USDC',
      asset_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      recipient: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
    },
  },
  brand: { color: '#C08D23', name: 'Hive Civilization' },
};

app.get('/.well-known/agent-card.json', (req, res) => res.json(AGENT_CARD));
app.get('/.well-known/ap2.json',         (req, res) => res.json(AP2));


app.listen(PORT, () => {
  console.log('HiveEscrow MCP Server running on :' + PORT);
  console.log('  Backend : ' + HIVE_BASE);
  console.log('  Status  : v0.1 — pending hivemorph backend build (Q3 2026 spec)');
  console.log('  Tools   : ' + TOOLS.length + ' (open_escrow, fund_escrow, release, dispute)');
  console.log('  Rails   : tool calls return 503 until backend is live (no mock)');
});
