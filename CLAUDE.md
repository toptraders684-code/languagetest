# CLAUDE.md

This file provides guidance for AI assistants (Claude Code and similar tools) working in this repository.

---

## Repository Status

This repository is currently in its initial state with no source files committed. This CLAUDE.md will be updated as the project evolves.

---

## Git Workflow

### Branching

- Feature branches must follow the pattern: `claude/<description>-<session-id>`
- Never push directly to `main` or `master` without explicit permission
- Always use `git push -u origin <branch-name>` when pushing

### Commit Messages

- Write clear, imperative-mood commit messages (e.g., "Add user authentication", not "Added" or "Adding")
- Keep the first line under 72 characters
- Add a blank line before any extended description

### Push Behavior

- On failure due to network errors, retry up to 4 times with exponential backoff: 2s, 4s, 8s, 16s
- Do **not** retry on auth (403) or branch-name errors — diagnose the root cause first

---

## Development Conventions

> These sections will be filled in once the project technology stack and structure are established.

### Language & Runtime

_To be documented when the stack is chosen._

### Project Structure

_To be documented when source files are added._

### Dependencies

_To be documented when a package manager file (e.g., `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`) is added._

### Build Commands

_To be documented._

### Test Commands

_To be documented._

### Lint / Format Commands

_To be documented._

---

## AI Assistant Guidelines

### General Behavior

- Read files before modifying them; never guess at file contents
- Prefer editing existing files over creating new ones
- Keep changes minimal and focused — do not refactor unrelated code
- Do not add comments, docstrings, or type annotations to code you did not change
- Do not introduce error handling for scenarios that cannot happen
- Avoid over-engineering: three similar lines of code is better than a premature abstraction

### Security

- Never introduce command injection, XSS, SQL injection, or other OWASP Top 10 vulnerabilities
- Validate input only at system boundaries (user input, external APIs); trust internal code
- Do not commit secrets, credentials, or `.env` files

### Risky Actions (always confirm with user first)

- Deleting files or branches
- Force-pushing or resetting git history
- Modifying CI/CD pipelines
- Any action that affects shared infrastructure or other people's work

---

## Updating This File

When the project gains a defined tech stack, source structure, or workflow, update the relevant sections above. Specifically:

1. Replace the placeholder sections under **Development Conventions** with accurate commands and descriptions
2. Add a **Architecture Overview** section describing the high-level structure of the codebase
3. Add any project-specific conventions or gotchas that an AI assistant would need to know
