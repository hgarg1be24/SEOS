/**
 * LLM Integration Layer for SEOS
 *
 * Supports OpenAI, Google Gemini and Anthropic.
 * All calls are made directly from the browser.
 *   - OpenAI  → https://api.openai.com  (supports browser CORS)
 *   - Gemini  → https://generativelanguage.googleapis.com (supports browser CORS)
 *   - Anthropic → proxied through Vite dev-server to bypass CORS
 *
 * Tool calling lets the LLM mutate the Zustand store (add requirements, etc.).
 */

import { useStore } from '../store';
import type { Requirement, UserStory } from '../types';

// ─── Build system prompt from current project context ───

function buildSystemPrompt(): string {
  const state = useStore.getState();
  const reqSummary = state.requirements
    .map((r) => `[${r.id}] (${r.type}, ${r.priority}) ${r.description}`)
    .join('\n');
  const storySummary = state.userStories
    .map((s) => `[${s.id}] As a ${s.role}, I want to ${s.action} so that ${s.benefit}`)
    .join('\n');

  return `You are the SEOS AI Assistant — a Software Engineering Operating System AI.
You help users engineer software projects by generating requirements, user stories,
API designs, architecture recommendations, ER diagrams, and documentation.

CURRENT PROJECT CONTEXT:
========================
Project Name: ${state.projectName}

Requirements (${state.requirements.length}):
${reqSummary || '(none yet)'}

User Stories (${state.userStories.length}):
${storySummary || '(none yet)'}

Architecture Pattern: ${state.architecture.pattern}

AVAILABLE TOOLS:
You can call the following tools to modify the project. When the user asks you to
"make a <X> app", "add requirements for <Y>", or similar, you MUST use the tools to
update the project data. Always explain what you changed after calling a tool.

IF THE USER PROPOSES A NEW APP IDEA OR MENTIONS A PROJECT TO BUILD:
You MUST call the initialize_full_project tool FIRST to populate all system modules at once (project name, requirements, user stories, architecture pattern). Never update just the project name alone.

RULES:
- When generating requirements, create BOTH Functional and Non-Functional ones.
- Assign realistic priority levels (Critical / High / Medium / Low).
- Generate unique IDs like REQ-101, REQ-102, etc.
- For user stories, follow the standard format: As a <role>, I want to <action>, so that <benefit>.
- Always provide acceptance criteria for user stories.
- Keep responses concise and structured.`;
}

// ─── Tool definitions (will be sent to the LLM) ───

function generateDefaultUML(projectName: string) {
  const cleanName = projectName.toLowerCase();
  if (cleanName.includes('food') || cleanName.includes('delivery')) {
    return {
      nodes: [
        {
          id: 'node-user',
          name: 'User',
          type: 'actor' as const,
          x: 50,
          y: 100,
          fields: [
            { name: 'id', type: 'UUID', pk: true },
            { name: 'name', type: 'String' },
            { name: 'email', type: 'String' },
            { name: 'phone', type: 'String' },
          ],
        },
        {
          id: 'node-restaurant',
          name: 'Restaurant',
          type: 'entity' as const,
          x: 350,
          y: 100,
          fields: [
            { name: 'id', type: 'UUID', pk: true },
            { name: 'name', type: 'String' },
            { name: 'cuisine', type: 'String' },
            { name: 'rating', type: 'Float' },
          ],
        },
        {
          id: 'node-order',
          name: 'Order',
          type: 'entity' as const,
          x: 200,
          y: 350,
          fields: [
            { name: 'id', type: 'UUID', pk: true },
            { name: 'userId', type: 'UUID', fk: true },
            { name: 'restaurantId', type: 'UUID', fk: true },
            { name: 'status', type: 'Enum' },
            { name: 'totalAmount', type: 'Decimal' },
          ],
        },
        {
          id: 'node-driver',
          name: 'DeliveryDriver',
          type: 'service' as const,
          x: 500,
          y: 350,
          fields: [
            { name: 'id', type: 'UUID', pk: true },
            { name: 'driverName', type: 'String' },
            { name: 'vehicleType', type: 'String' },
            { name: 'currentLocation', type: 'Point' },
          ],
        },
      ],
      edges: [
        { id: 'e1', from: 'node-user', to: 'node-order', label: 'places', cardinalityFrom: '1', cardinalityTo: '0..*' },
        { id: 'e2', from: 'node-restaurant', to: 'node-order', label: 'fulfills', cardinalityFrom: '1', cardinalityTo: '0..*' },
        { id: 'e3', from: 'node-driver', to: 'node-order', label: 'delivers', cardinalityFrom: '1', cardinalityTo: '0..*' },
      ],
    };
  }
  
  return {
    nodes: [
      {
        id: 'node-user',
        name: 'User',
        type: 'actor' as const,
        x: 80,
        y: 120,
        fields: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'username', type: 'String' },
          { name: 'email', type: 'String' },
          { name: 'role', type: 'String' },
        ],
      },
      {
        id: 'node-core',
        name: `${projectName.replace(/\s+/g, '')}Item`,
        type: 'entity' as const,
        x: 380,
        y: 120,
        fields: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'title', type: 'String' },
          { name: 'status', type: 'String' },
          { name: 'created_at', type: 'Timestamp' },
        ],
      },
      {
        id: 'node-audit',
        name: 'AuditLog',
        type: 'service' as const,
        x: 230,
        y: 360,
        fields: [
          { name: 'id', type: 'UUID', pk: true },
          { name: 'action', type: 'String' },
          { name: 'performed_by', type: 'UUID', fk: true },
          { name: 'timestamp', type: 'Timestamp' },
        ],
      },
    ],
    edges: [
      { id: 'e1', from: 'node-user', to: 'node-core', label: 'manages', cardinalityFrom: '1', cardinalityTo: '0..*' },
      { id: 'e2', from: 'node-user', to: 'node-audit', label: 'triggers', cardinalityFrom: '1', cardinalityTo: '0..*' },
    ],
  };
}

function generateDefaultOpenAPI(projectName: string) {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `openapi: 3.1.0
info:
  title: ${projectName} API
  version: 1.0.0
  description: Comprehensive REST API for ${projectName}
paths:
  /api/v1/${slug}/items:
    get:
      summary: List all ${projectName} items
      responses:
        '200':
          description: Successful response
    post:
      summary: Create a new item in ${projectName}
      responses:
        '201':
          description: Item created
  /api/v1/${slug}/items/{id}:
    get:
      summary: Get details for a specific ${projectName} item
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Item details
    put:
      summary: Update an item
      responses:
        '200':
          description: Item updated
    delete:
      summary: Delete an item
      responses:
        '204':
          description: Item deleted
`;
}

function generateDefaultDocs(projectName: string) {
  return [
    {
      id: 'srs',
      title: 'Software Requirements Specification',
      type: 'SRS' as const,
      content: `# Software Requirements Specification (SRS)
# ${projectName}

## 1. Introduction
### 1.1 Purpose
This document specifies the core software requirements for **${projectName}**, a cloud-native platform designed to deliver high availability and seamless user experience.

### 1.2 Scope
${projectName} provides end-to-end functionality including user management, real-time status updates, audit logging, and secure API access.

## 2. System Overview
The architecture is structured around microservices with a decoupled backend engine and modern frontend interface.
`
    },
    {
      id: 'sdd',
      title: 'Software Design Document',
      type: 'SDD' as const,
      content: `# Software Design Document (SDD)
# ${projectName}

## 1. System Architecture
${projectName} implements an event-driven architecture with dedicated services for processing requests, managing persistent data, and enforcing role-based access control.

## 2. Component Design
- **API Gateway**: Handles routing and CORS.
- **Core Service**: Processes business logic.
- **Database Layer**: Relational data store for structured entities.
`
    },
    {
      id: 'readme',
      title: 'README',
      type: 'README' as const,
      content: `# ${projectName}

Welcome to **${projectName}**! This repository contains the system specifications, API designs, user stories, and system architecture.

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`
`
    }
  ];
}

interface ToolResult {
  tool: string;
  result: string;
}

function executeToolCall(toolName: string, args: Record<string, unknown>): ToolResult {
  const store = useStore.getState();

  switch (toolName) {
    case 'initialize_full_project': {
      const name = (args.projectName as string) || (args.name as string);
      const reqs = (args.requirements as Requirement[]) || [];
      const stories = (args.userStories as UserStory[]) || [];
      const arch = args.architecture as { pattern?: string; rationale?: string; techStack?: string[] } | undefined;
      const ideaText = (args.productIdea as string) || (args.idea as string) || `System specification and design for ${name}.`;

      if (name) store.setProjectName(name);
      store.setProductIdea(ideaText);

      if (reqs.length > 0) store.setRequirements(reqs);
      if (stories.length > 0) store.setUserStories(stories);
      
      // Sync Architecture
      store.setArchitecture({
        pattern: arch?.pattern || 'Event-Driven Microservices',
        rationale: arch?.rationale || `High availability and scalable architecture tailored for ${name}.`,
        components: [
          { name: 'API Gateway', tech: 'Kong / Nginx', purpose: 'Routes incoming client requests and enforces rate limits' },
          { name: 'Auth Service', tech: 'Node.js / OAuth2', purpose: 'Handles user identity, JWT issuing, and access control' },
          { name: `${name} Core Engine`, tech: 'Go / Python', purpose: 'Processes primary business logic and domain workflows' },
          { name: 'Primary Database', tech: 'PostgreSQL', purpose: 'Relational data store for transactional data' },
        ],
        tradeoffs: [
          { pro: 'High scalability and decoupled domain services', con: 'Increased operational overhead and telemetry setup' }
        ]
      });

      // Sync UML / System Modeling
      const defaultUML = generateDefaultUML(name);
      store.setUMLNodes(defaultUML.nodes);
      store.setUMLEdges(defaultUML.edges);

      // Sync API Specification
      store.setOpenapiYaml(generateDefaultOpenAPI(name));

      // Sync Documentation
      store.setDocs(generateDefaultDocs(name));

      return {
        tool: toolName,
        result: `Initialized full project "${name}" across all modules (Requirements, Stories, System Modeling, Architecture, API Designer, and Docs)!`
      };
    }
    case 'set_project_name': {
      const name = args.name as string;
      store.setProjectName(name);
      return { tool: toolName, result: `Updated project name to ${name}` };
    }
    case 'set_requirements': {
      const reqs = args.requirements as Requirement[];
      store.setRequirements(reqs);
      return { tool: toolName, result: `Set ${reqs.length} requirements` };
    }
    case 'add_requirement': {
      const req = args as unknown as Requirement;
      store.addRequirement(req);
      return { tool: toolName, result: `Added requirement ${req.id}` };
    }
    case 'set_user_stories': {
      const stories = args.stories as UserStory[];
      store.setUserStories(stories);
      return { tool: toolName, result: `Set ${stories.length} user stories` };
    }
    case 'add_user_story': {
      const story = args as unknown as UserStory;
      store.addUserStory(story);
      return { tool: toolName, result: `Added user story ${story.id}` };
    }
    case 'set_api_spec': {
      const yaml = args.yaml as string;
      store.setOpenapiYaml(yaml);
      return { tool: toolName, result: 'Updated OpenAPI specification' };
    }
    case 'set_architecture': {
      const arch = args as unknown as { pattern: string; rationale: string; components: any[]; tradeoffs: any[] };
      store.setArchitecture(arch);
      return { tool: toolName, result: `Set architecture: ${arch.pattern}` };
    }
    default:
      return { tool: toolName, result: `Unknown tool: ${toolName}` };
  }
}

// ─── Tool schema for OpenAI / Anthropic compatible format ───

const TOOLS_SCHEMA = [
  {
    type: 'function' as const,
    function: {
      name: 'initialize_full_project',
      description: 'Initialize or update the entire project (name, requirements, user stories, architecture pattern) in ONE SINGLE ACTION when starting a new app idea.',
      parameters: {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'The overall name of the application or system.' },
          requirements: {
            type: 'array',
            description: 'Array of at least 5-8 detailed functional and non-functional requirements.',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Unique ID like REQ-101' },
                type: { type: 'string', enum: ['Functional', 'Non-Functional'] },
                priority: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
                description: { type: 'string' },
                status: { type: 'string', enum: ['draft', 'approved', 'rejected'] },
              },
              required: ['id', 'type', 'priority', 'description', 'status'],
            },
          },
          userStories: {
            type: 'array',
            description: 'Array of corresponding agile user stories with acceptance criteria.',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Unique ID like US-101' },
                role: { type: 'string' },
                action: { type: 'string' },
                benefit: { type: 'string' },
                criteria: { type: 'array', items: { type: 'string' } },
                status: { type: 'string', enum: ['draft', 'approved', 'rejected'] },
                reqId: { type: 'string' },
              },
              required: ['id', 'role', 'action', 'benefit', 'criteria', 'status', 'reqId'],
            },
          },
          architecture: {
            type: 'object',
            description: 'Proposed system architecture pattern and rationale.',
            properties: {
              pattern: { type: 'string', description: 'e.g. Microservices, Event-Driven, Monolith' },
              rationale: { type: 'string', description: 'Why this architecture is chosen' },
              techStack: { type: 'array', items: { type: 'string' } },
            },
            required: ['pattern', 'rationale'],
          },
        },
        required: ['projectName', 'requirements', 'userStories'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_project_name',
      description: 'Updates the name of the project when the user indicates a new project idea or name.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The new project name.' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_requirements',
      description: 'Replace ALL project requirements with a new set. Use when the user asks to generate requirements for a new app idea.',
      parameters: {
        type: 'object',
        properties: {
          requirements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Unique ID like REQ-101' },
                type: { type: 'string', enum: ['Functional', 'Non-Functional'] },
                priority: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
                description: { type: 'string' },
                status: { type: 'string', enum: ['draft', 'approved', 'rejected'] },
              },
              required: ['id', 'type', 'priority', 'description', 'status'],
            },
          },
        },
        required: ['requirements'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_requirement',
      description: 'Add a single new requirement to the project.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['Functional', 'Non-Functional'] },
          priority: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
          description: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'approved', 'rejected'] },
        },
        required: ['id', 'type', 'priority', 'description', 'status'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_user_stories',
      description: 'Replace ALL user stories with a new set.',
      parameters: {
        type: 'object',
        properties: {
          stories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Unique ID like US-101' },
                role: { type: 'string' },
                action: { type: 'string' },
                benefit: { type: 'string' },
                criteria: { type: 'array', items: { type: 'string' } },
                status: { type: 'string', enum: ['draft', 'approved', 'rejected'] },
                reqId: { type: 'string' },
              },
              required: ['id', 'role', 'action', 'benefit', 'criteria', 'status', 'reqId'],
            },
          },
        },
        required: ['stories'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_user_story',
      description: 'Add a single new user story.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          role: { type: 'string' },
          action: { type: 'string' },
          benefit: { type: 'string' },
          criteria: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['draft', 'approved', 'rejected'] },
          reqId: { type: 'string' },
        },
        required: ['id', 'role', 'action', 'benefit', 'criteria', 'status', 'reqId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_api_spec',
      description: 'Replace the OpenAPI YAML specification.',
      parameters: {
        type: 'object',
        properties: {
          yaml: { type: 'string', description: 'Full OpenAPI 3.1 YAML string' },
        },
        required: ['yaml'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_architecture',
      description: 'Set the architecture recommendation for the project.',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string' },
          rationale: { type: 'string' },
          components: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                tech: { type: 'string' },
                purpose: { type: 'string' },
              },
              required: ['name', 'tech', 'purpose'],
            },
          },
          tradeoffs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pro: { type: 'string' },
                con: { type: 'string' },
              },
              required: ['pro', 'con'],
            },
          },
        },
        required: ['pattern', 'rationale', 'components', 'tradeoffs'],
      },
    },
  },
];

// ─── Provider-specific API callers ───

async function callOpenAI(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  const body = {
    model: 'gpt-4o',
    messages: [{ role: 'system', content: buildSystemPrompt() }, ...messages],
    tools: TOOLS_SCHEMA,
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 4096,
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${errBody}`);
  }

  const data = await resp.json();
  const choice = data.choices?.[0];

  // Handle tool calls
  if (choice?.message?.tool_calls?.length) {
    const toolResults: string[] = [];
    for (const tc of choice.message.tool_calls) {
      const args = JSON.parse(tc.function.arguments);
      const result = executeToolCall(tc.function.name, args);
      toolResults.push(result.result);
    }
    // If there's also text content, combine
    const textContent = choice.message.content || '';
    return textContent + (toolResults.length ? `\n\n✅ **Actions taken:** ${toolResults.join(', ')}` : '');
  }

  return choice?.message?.content || 'No response generated.';
}

async function callGemini(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  // Dynamically resolve an available model for this API Key
  let modelName = 'gemini-1.5-flash';
  try {
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listResp.ok) {
      const listData = await listResp.json();
      if (listData.models && Array.isArray(listData.models)) {
        const validModels: { name: string; supportedGenerationMethods?: string[] }[] = listData.models.filter(
          (m: { name: string; supportedGenerationMethods?: string[] }) =>
            m.supportedGenerationMethods?.includes('generateContent')
        );

        const match =
          validModels.find((m) => m.name.includes('flash-002') || m.name.includes('flash-001') || m.name.includes('1.5-flash') || m.name.includes('2.0-flash')) ||
          validModels.find((m) => m.name.includes('flash')) ||
          validModels.find((m) => m.name.includes('pro')) ||
          validModels[0];

        if (match) {
          modelName = match.name.replace(/^models\//, '');
          console.log(`[SEOS LLM] Auto-selected Gemini model: ${modelName}`);
        }
      }
    }
  } catch (e) {
    console.warn('[SEOS LLM] Failed to list models, defaulting to gemini-1.5-flash:', e);
  }

  // Convert messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Gemini tool format
  const tools = [{
    function_declarations: TOOLS_SCHEMA.map(t => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    })),
  }];

  const body = {
    system_instruction: { parts: [{ text: buildSystemPrompt() }] },
    contents,
    tools,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${errBody}`);
  }

  const data = await resp.json();
  const candidate = data.candidates?.[0]?.content;

  if (!candidate?.parts) return 'No response generated.';

  let textContent = '';
  const toolResults: string[] = [];

  for (const part of candidate.parts) {
    if (part.text) {
      textContent += part.text;
    }
    if (part.functionCall) {
      const result = executeToolCall(part.functionCall.name, part.functionCall.args || {});
      toolResults.push(result.result);
    }
  }

  return textContent + (toolResults.length ? `\n\n✅ **Actions taken:** ${toolResults.join(', ')}` : '');
}

async function callAnthropic(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  // Anthropic tool format
  const anthropicTools = TOOLS_SCHEMA.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters,
  }));

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    tools: anthropicTools,
  };

  // Goes through Vite proxy to avoid CORS (see vite.config.ts)
  const resp = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${errBody}`);
  }

  const data = await resp.json();

  let textContent = '';
  const toolResults: string[] = [];

  for (const block of data.content || []) {
    if (block.type === 'text') {
      textContent += block.text;
    }
    if (block.type === 'tool_use') {
      const result = executeToolCall(block.name, block.input || {});
      toolResults.push(result.result);
    }
  }

  return textContent + (toolResults.length ? `\n\n✅ **Actions taken:** ${toolResults.join(', ')}` : '');
}

// ─── Public API ───

export async function sendChatMessage(userMessage: string): Promise<string> {
  const state = useStore.getState();
  const { apiKeys, selectedProvider, messages } = state;
  const apiKey = apiKeys[selectedProvider];

  if (!apiKey?.trim()) {
    return `⚠️ No API key configured for **${selectedProvider}**. Please click the model selector (bottom-left of the chat input) → "Manage API Keys..." to add one.`;
  }

  // Build conversation history (last 20 messages for context window)
  let history = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-20)
    .map((m) => ({ role: m.role as string, content: m.content }));

  // Add the current user message if it's not already the last message in history
  // (Zustand getState() might already have it if addMessage was called synchronously)
  if (history.length === 0 || history[history.length - 1].content !== userMessage) {
    history.push({ role: 'user', content: userMessage });
  }

  // Ensure strict alternation of roles (required by Gemini and good practice)
  const collapsedHistory: { role: string; content: string }[] = [];
  for (const msg of history) {
    if (collapsedHistory.length > 0 && collapsedHistory[collapsedHistory.length - 1].role === msg.role) {
      collapsedHistory[collapsedHistory.length - 1].content += '\\n\\n' + msg.content;
    } else {
      collapsedHistory.push({ ...msg });
    }
  }
  history = collapsedHistory;

  try {
    switch (selectedProvider) {
      case 'openai':
        return await callOpenAI(apiKey, history);
      case 'gemini':
        return await callGemini(apiKey, history);
      case 'anthropic':
        return await callAnthropic(apiKey, history);
      default:
        return 'Unknown provider.';
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[SEOS LLM] Error calling ${selectedProvider}:`, err);
    return `❌ **API Error (${selectedProvider}):** ${errorMessage}`;
  }
}
