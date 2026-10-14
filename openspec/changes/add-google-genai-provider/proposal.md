# Proposal

## Why

Hoy la app solo puede generar snippets con Ollama (local) y OpenRouter. Los usuarios con una cuenta de Google AI Studio no pueden usar Gemini. Además, la credencial del proveedor existente (API key de OpenRouter) se guarda en `localStorage` en texto plano, lo que expone la clave a cualquier lectura del almacenamiento del webview.

## What Changes

- Añadir un tercer proveedor de IA, **Google (Gemini)**, integrado mediante el SDK oficial `@google/genai` en el frontend, siguiendo el flujo actual de generación de snippets (prompt → contenido del snippet).
- Nueva pestaña **Google** en el diálogo de configuración con un campo para la API key y un campo para el modelo (`gemini-2.0-flash` por defecto).
- Guardar la API key de Google de forma segura en el llavero del sistema operativo (Windows Credential Manager / macOS Keychain / Linux Secret Service) mediante comandos Tauri nuevos y el crate `keyring`, en lugar de `localStorage`.
- Añadir la opción de proveedor Google en el asistente IA (botón flotante) y enrutar la generación a Gemini cuando esté seleccionado.
- Añadir las claves de i18n correspondientes en `es-ES` y `en-UK`.
- Nuevas dependencias: `@google/genai` (npm) y `keyring` (Cargo).
- Fuera de alcance: migrar la API key de OpenRouter al llavero (se mantiene en `localStorage`) y streaming incremental de respuestas (se mantiene la respuesta completa, igual que OpenRouter/Ollama).

## Capabilities

### New Capabilities

- `ai-provider-integration`: Selección, configuración y uso de proveedores de IA (Ollama, OpenRouter, Google Gemini) para generar contenido de snippets, incluido el almacenamiento seguro de las credenciales del proveedor.

### Modified Capabilities

- Ninguna. No existe spec previo para los proveedores de IA.

## Impact

- **Frontend**: `src/dialogs/SettingsDialog/index.tsx` (nueva pestaña), nuevo `src/dialogs/SettingsDialog/GoogleTab.tsx`, `src/components/layout/FabAi.tsx` (opción de proveedor y enrutado), `src/messages/es-ES.ts`, `src/messages/en-UK.ts`, `package.json`.
- **Backend Tauri**: `src-tauri/src/ai.rs` (o un módulo de secretos nuevo), `src-tauri/src/lib.rs` (registro de comandos), `src-tauri/Cargo.toml`.
- **Dependencias**: `@google/genai` (npm), `keyring` (Cargo, con feature nativa por plataforma).
- **Seguridad**: la API key de Google no se persiste en `localStorage`; se guarda en el llavero del SO. Sí se carga en memoria del webview para pasarla al SDK en cada solicitud.
- **Compilación**: requiere recompilar el binario Rust (`keyring` usa APIs nativas del SO).
