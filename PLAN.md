# CueLine MCP Server - Implementation Plan

## Overview
Build a Character.AI MCP server enabling Claude to interact with your Character.AI conversations - retrieve chat history, summarize storylines, find memorable moments, and send contextual messages.

**Important**: This MCP server will be used in both:
- **Claude Desktop**: For visual, interactive conversations
- **Claude Code (CLI)**: For terminal-based development workflows

Both environments use the same MCP protocol, so one implementation works for both.

## Technology Stack
- **Language**: TypeScript/Node.js
- **MCP SDK**: @modelcontextprotocol/sdk (v1.0.4+)
- **CAI Library**: CAINode (v1.5.0+) - lightweight, no Puppeteer, excellent history support
- **Validation**: Zod for schema validation
- **Testing**: Vitest with integration tests

## Why CAINode?
After researching multiple Character.AI libraries:
- ✅ No Puppeteer dependency (lightweight, faster startup)
- ✅ Built-in conversation history APIs (`history_chat_turns()`, `history_conversation_list()`)
- ✅ Native WebSocket + Fetch (more efficient than browser automation)
- ✅ More actively maintained than alternatives
- ✅ Streaming support for real-time responses

## Project Structure

```
CueLine/
├── src/
│   ├── index.ts                    # Main MCP server entry point
│   ├── client/
│   │   ├── cai-client.ts          # CAINode wrapper
│   │   └── types.ts               # TypeScript types
│   ├── tools/
│   │   ├── list-characters.ts     # List all characters tool
│   │   ├── get-conversation-history.ts
│   │   ├── send-message.ts
│   │   └── search-conversations.ts
│   ├── utils/
│   │   ├── error-handler.ts       # Centralized error handling
│   │   ├── rate-limiter.ts        # Rate limiting
│   │   ├── cache.ts               # In-memory cache
│   │   └── logger.ts              # Logging utility
│   └── config/
│       └── environment.ts         # Environment validation
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## MCP Tools to Implement

### 1. `list-characters`
**Purpose**: List all characters you've chatted with

**Parameters**: None

**Returns**:
```json
{
  "characters": [
    {
      "character_id": "string",
      "name": "string",
      "title": "string",
      "last_interaction": "ISO timestamp"
    }
  ],
  "total_count": number
}
```

**Implementation**: Use `client.character.recent_list()`, cache for 5 minutes

### 2. `get-conversation-history`
**Purpose**: Retrieve conversation history from specific character

**Parameters**:
- `character_id` (required): string
- `chat_id` (optional): string - uses latest if not provided
- `limit` (optional): number (1-100, default 50)
- `offset` (optional): number (default 0)

**Returns**:
```json
{
  "character_name": "string",
  "chat_id": "string",
  "messages": [
    {
      "id": "string",
      "text": "string",
      "author": "user" | "character",
      "timestamp": "ISO timestamp"
    }
  ],
  "has_more": boolean,
  "total_messages": number
}
```

**Implementation**: Use `client.character.connect()` + `chat.history()`, cache for 2 minutes

### 3. `send-message`
**Purpose**: Send message to character and get response

**Parameters**:
- `character_id` (required): string
- `message` (required): string (1-2000 chars)
- `chat_id` (optional): string - creates new chat if not provided

**Returns**:
```json
{
  "chat_id": "string",
  "message_id": "string",
  "user_message": "string",
  "character_response": "string",
  "timestamp": "ISO timestamp"
}
```

**Implementation**: Use `character.create_new_conversation()` or connect to existing, `chat.send_message()`, invalidate cache after sending

### 4. `search-conversations`
**Purpose**: Search conversation history for specific content

**Parameters**:
- `query` (required): string
- `character_id` (optional): string - filter by specific character
- `limit` (optional): number (1-50, default 20)

**Returns**:
```json
{
  "results": [
    {
      "character_id": "string",
      "character_name": "string",
      "message": {
        "text": "string",
        "author": "string",
        "timestamp": "ISO timestamp"
      }
    }
  ],
  "total_results": number,
  "query": "string"
}
```

**Implementation**: Fetch conversations, search locally (CAI has no native search API), cache for 1 minute

## Configuration

### Environment Variables (.env)
```bash
# Required
CAI_TOKEN=your_token_here  # Get from c.ai browser localStorage: char_token

# Optional - Cache TTL (milliseconds)
CACHE_TTL_CHARACTERS=300000  # 5 minutes
CACHE_TTL_HISTORY=120000     # 2 minutes
CACHE_TTL_SEARCH=60000       # 1 minute

# Optional - Rate limiting
RATE_LIMIT_REQUESTS=30       # Requests per window
RATE_LIMIT_WINDOW_MS=60000   # 1 minute window

# Optional - Logging
LOG_LEVEL=info               # debug|info|warn|error
NODE_ENV=development         # development|production|test
```

### How to Get CAI_TOKEN
1. Open Character.AI in browser
2. Open Developer Tools (F12)
3. Go to Application tab → Local Storage → https://character.ai
4. Copy value of `char_token` key

### MCP Server Configuration

For **Claude Desktop**, add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "cueline": {
      "command": "node",
      "args": ["C:\\Repositories\\CueLine\\dist\\index.js"],
      "env": {
        "CAI_TOKEN": "your_token_here"
      }
    }
  }
}
```

For **Claude Code**, add to MCP settings file:
```json
{
  "mcpServers": {
    "cueline": {
      "command": "node",
      "args": ["C:\\Repositories\\CueLine\\dist\\index.js"],
      "env": {
        "CAI_TOKEN": "your_token_here"
      }
    }
  }
}
```

Both can also use a `.env` file in the project root instead of inline env vars.

## Implementation Steps

### Phase 1: Project Setup
1. Initialize npm project with TypeScript
2. Install dependencies: `@modelcontextprotocol/sdk`, `cainode`, `zod`
3. Configure TypeScript (ES2022 modules, strict mode)
4. Create project structure
5. Set up .gitignore (node_modules, dist, .env)

### Phase 2: Core Infrastructure
1. **environment.ts**: Validate and load environment variables with Zod
2. **logger.ts**: Stderr-only logging (critical for MCP stdio)
3. **error-handler.ts**: Centralized error handling with CAIError class
4. **cache.ts**: Simple in-memory cache with TTL
5. **rate-limiter.ts**: Token bucket rate limiting

### Phase 3: CAI Client Wrapper
1. **cai-client.ts**: Wrap CAINode library
2. Implement lazy authentication (only on first use)
3. Add methods: `listCharacters()`, `getConversationHistory()`, `sendMessage()`
4. Handle CAI-specific errors and map to CAIError
5. **types.ts**: TypeScript interfaces for all CAI responses

### Phase 4: MCP Server & Tools
1. **index.ts**: Create MCP server with stdio transport
2. Register tools with proper schemas
3. Implement tool request handlers with rate limiting
4. Wire up CAI client to tool handlers
5. Add error handling for all tool calls

### Phase 5: Individual Tool Implementation
1. **list-characters.ts**: List recent characters with caching
2. **get-conversation-history.ts**: Fetch and paginate conversation history
3. **send-message.ts**: Send message and return response
4. **search-conversations.ts**: Client-side search across conversations

### Phase 6: Testing & Documentation
1. Write unit tests for CAI client methods
2. Write integration tests for MCP tools
3. Test with MCP Inspector: `npx @modelcontextprotocol/inspector node dist/index.js`
4. Create README.md with setup instructions
5. Document .env.example with all options

## Key Architectural Decisions

1. **Single CAI Client Instance**: Reuse connection across requests for efficiency
2. **Aggressive Caching**: Cache read operations, invalidate on writes
3. **Proactive Rate Limiting**: Prevent API blocks with token bucket algorithm
4. **Local Search**: Fetch conversations and search client-side (no native CAI search API)
5. **Graceful Error Handling**: Return partial results with error details vs complete failure
6. **Stderr-only Logging**: Critical for MCP stdio transport compatibility
7. **Type Safety**: Full TypeScript coverage with Zod validation

## Critical Files

These 5 files form the foundation:

1. **C:\Repositories\CueLine\package.json** - Dependencies and build config
2. **C:\Repositories\CueLine\src\config\environment.ts** - Environment validation
3. **C:\Repositories\CueLine\src\client\cai-client.ts** - CAI integration layer
4. **C:\Repositories\CueLine\src\utils\error-handler.ts** - Error handling
5. **C:\Repositories\CueLine\src\index.ts** - MCP server entry point

## Verification & Testing

### Manual Testing Steps
1. Build project: `npm run build`
2. Set CAI_TOKEN in .env
3. Test with MCP Inspector: `npx @modelcontextprotocol/inspector node dist/index.js`
4. In Inspector, test each tool:
   - Call `list-characters` (should return your character list)
   - Call `get-conversation-history` with a character_id
   - Call `search-conversations` with a query
   - Call `send-message` to send a test message

### Integration Testing with Claude Desktop
1. Configure Claude Desktop to use CueLine server (see configuration above)
2. Restart Claude Desktop
3. Ask Claude to: "List all my Character.AI characters"
4. Ask Claude to: "Get conversation history from [character name]"
5. Ask Claude to: "Search my conversations for [keyword]"
6. Ask Claude to: "Send a message to [character] saying [message]"

### Integration Testing with Claude Code
1. Configure Claude Code MCP settings (see configuration above)
2. Restart Claude Code or reload MCP servers
3. In a Claude Code session, ask: "Use the cueline MCP to list my Character.AI characters"
4. Ask: "Get the conversation history from [character name]"
5. Ask: "Search my conversations for [keyword]"
6. Ask: "Send a message to [character] with [content]"

### Unit Testing
1. Run tests: `npm test`
2. Check coverage: `npm run test:coverage`
3. Target 80%+ coverage for business logic

## Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "cainode": "^1.5.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8",
    "prettier": "^3.4.2",
    "eslint": "^9.17.0"
  }
}
```

## Security & Best Practices

1. **Never commit .env** - Add to .gitignore
2. **Token security**: CAI_TOKEN is sensitive, store securely
3. **Rate limiting**: Prevent API abuse and blocks
4. **Error logging**: Log to stderr only (stdout breaks MCP)
5. **Input validation**: Use Zod for all tool parameters
6. **Graceful degradation**: Handle CAI API failures gracefully

## Known Limitations

1. **No Official API**: All solutions use unofficial Character.AI API
2. **ToS Risk**: May violate Character.AI terms of service
3. **Breakage Risk**: CAI updates may break functionality
4. **Rate Limits**: Guest accounts have message limits
5. **Search Limitations**: Client-side search only, may be slow for many conversations
6. **No Cloudflare Issues**: CAINode avoids Puppeteer, but Cloudflare may still block requests

## Next Steps After Implementation

1. Add streaming support for send-message (real-time responses)
2. Implement conversation export (save full history to file)
3. Add character creation/management tools
4. Implement group chat support
5. Add image generation/upload tools
6. Support voice messages and TTS
