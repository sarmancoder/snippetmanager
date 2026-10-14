# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## AI providers

Snippet content can be generated with three providers, selectable from the AI
assistant button and configured in **Settings**:

- **Ollama** – local models; set the Ollama URL and model.
- **OpenRouter** – set the API key and model (stored in `localStorage`).
- **Google (Gemini)** – set the API key and model (default `gemini-2.0-flash`).
  The API key is stored securely in the operating system credential store
  (Windows Credential Manager, macOS Keychain or Linux Secret Service) and is
  never written to `localStorage`.
