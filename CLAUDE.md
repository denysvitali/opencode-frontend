# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run build:demo` - Build with demo mode enabled
- `npm run preview` - Preview production build
- `npm run preview:demo` - Preview demo build
- `npm run lint` - Run ESLint

### OpenAPI Type Generation
- `make generate-openapi-ts` - Generate TypeScript types from OpenAPI spec at `./openapi/orchestrator_openapi.yaml`

## Architecture Overview

This is a React frontend for the OpenCode AI development platform with a three-tier architecture:

1. **Frontend (this repo)** - Web interface using React/TypeScript
2. **Orchestrator Server** - Central API server managing sandbox lifecycle
3. **Sandbox Pods** - Individual Kubernetes pods where AI agents execute

### Key Components

**State Management (Zustand)**
- `appStore.ts` - Main application state (conversations, users, connection status)
- `settingsStore.ts` - User settings and API configuration
- `uiStore.ts` - UI state (mobile detection, modals)
- `workspaceStore.ts` - Workspace and session management

**Services**
- `orchestratorService.ts` - Type-safe API client for orchestrator (using openapi-fetch)
- `dataService.ts` - Abstract data service interface
- `realDataService.ts` - Real API implementation
- `mockDataService.ts` - Mock data for development

**Core Features**
- Chat interface with AI agents
- File explorer with Monaco Editor
- Git diff viewer
- Terminal viewer (read-only)
- Session management with sandbox status tracking
- PWA support with service worker

### Data Flow

1. Frontend communicates with Orchestrator via REST API
2. Orchestrator manages Kubernetes pods (sandboxes)
3. Each conversation session maps to a sandbox pod
4. Real-time updates show sandbox status: connected/connecting/error/disconnected

### Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- Monaco Editor (code viewing)
- openapi-fetch (type-safe API client)
- gRPC-Web + Protocol Buffers (future real-time communication)

## Build Metadata

The build system automatically injects:
- `__VERSION__` - Git tag or "development"
- `__COMMIT_HASH__` - Short commit hash (with "-dirty" if uncommitted changes)
- `__BUILD_DATE__` - Build timestamp
- `__DEMO_MODE__` - Demo mode flag

## Development Notes

- All imports use `.js` extensions (ESM compatibility)
- OpenAPI types are auto-generated from `./openapi/orchestrator_openapi.yaml`
- Zustand stores are persisted to localStorage
- Service worker enables PWA functionality
- Monaco Editor provides syntax highlighting for file viewing