# Textrux Development Guidelines

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build production bundle (runs TypeScript check first)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Code Style
- Use TypeScript with strict type checking and explicit return types
- Follow React hooks rules strictly
- PascalCase for components, interfaces, and classes; camelCase for variables and functions
- Imports: React first, then external libraries, then local modules (sorted alphabetically)
- Prefer functional components with hooks over class components
- Use named exports for better tree-shaking
- Handle errors explicitly with type-safe error handling
- Keep components small and focused on a single responsibility
- Use semantic variable/function names that describe purpose, not implementation

## Project Structure
- Structure follows domain concepts (parser, pattern, resolver, structure, etc.)
- UI components in `src/ui` directory
- Utilities in `src/util` directory