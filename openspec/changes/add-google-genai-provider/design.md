# Design

## Context

Ver `proposal.md - Why`. Estado actual relevante:

- Los proveedores de IA (Ollama y OpenRouter) están implementados como comandos Tauri en `src-tauri/src/ai.rs` y registrados en `src-tauri/src/lib.rs`; el frontend los invoca con `invoke` desde `src/components/layout/FabAi.tsx`.
- La configuración del proveedor vive en pestañas de `src/dialogs/SettingsDialog/` (`OllamaTab.tsx`, `OpenRouterTab.tsx`) y se persiste con `useLocalStorage`. La API key de OpenRouter se guarda en `localStorage` en texto plano (clave `settings-openrouter-api-key`).
- El asistente (`FabAi.tsx`) guarda la fuente seleccionada en `settings-model-source` (`'ollama' | 'openrouter'`) y lee el modelo y la API key correspondientes desde `localStorage`.
- La app es Tauri v2 con CSP deshabilitada (`"csp": null`) y sin restricciones de red adicionales, por lo que el webview puede hacer peticiones HTTP directas.
- Los textos de UI se resuelven con `$t(key)` desde `src/messages/es-ES.ts` y `src/messages/en-UK.ts`.

## Goals / Non-Goals

**Goals:**

- Añadir Google Gemini como tercer proveedor, seleccionable desde el asistente, usando el SDK `@google/genai` en el frontend.
- Ofrecer una pestaña de configuración Google (API key + modelo) coherente con las pestañas existentes.
- Guardar la API key de Google en el llavero del sistema operativo mediante comandos Tauri, sin persistirla en `localStorage`.
- Mantener el mismo contrato de generación que los otros proveedores: misma instrucción de sistema, `temperature` baja y salida JSON.

**Non-Goals:**

- No se migra la API key de OpenRouter al llavero.
- No se implementa streaming incremental de respuestas.
- No se añade una abstracción genérica de proveedores ni se refactorizan los comandos Rust existentes.
- No se cambia el flujo de inserción de contenido en el editor (`DualEditor`).

## Decisions

### 1. Google se integra con el SDK `@google/genai` en el frontend

El usuario eligió explícitamente el SDK JS. La llamada a Gemini se hace desde un módulo de frontend (por ejemplo `src/lib/ai/google.ts`) usando:

```ts
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({
  model,
  contents: prompt,
  config: {
    systemInstruction: "<misma instrucción que OpenRouter/Ollama>",
    temperature: 0.1,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Nombre descriptivo del snippet" },
        prefix: { type: Type.STRING, description: "El atajo que activa el snippet en VS Code" },
        body: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Líneas del código del snippet",
        },
        description: { type: Type.STRING, description: "Breve explicación de lo que hace el snippet" },
        scope: {
          type: Type.STRING,
          description: "Lenguaje o lenguajes donde aplica (ej: javascript, typescript)",
        },
      },
      required: ["name", "prefix", "body", "description", "scope"],
    },
  },
});
const text = response.text;
```

El `responseSchema` fuerza que Gemini devuelva exactamente los campos del snippet de VS Code, evitando texto adicional.

- **Alternativas consideradas**: comando Rust con `reqwest` a `generativelanguage.googleapis.com` (coherente con Ollama/OpenRouter). Rechazada porque el usuario pidió el SDK `@google/genai`.
- **Consecuencia**: la API key debe estar disponible en el frontend en el momento de la llamada, lo que motiva la decisión 2.

### 2. La API key se almacena en el llavero del SO vía crate `keyring`

Se añaden comandos Tauri en Rust (en `src-tauri/src/ai.rs` o un módulo `secrets.rs`) que usan el crate `keyring`:

- `save_google_api_key(api_key: String) -> Result<(), String>`
- `get_google_api_key() -> Result<Option<String>, String>`

Con un servicio (`service`) y una cuenta (`account`) fijos (p. ej. `com.sarma.snippetmanager` / `google-api-key`). El frontend obtiene la key con `get_google_api_key` al generar o al abrir la pestaña, y la envía con `save_google_api_key` al guardar.

- **Alternativas consideradas**:
  - `localStorage` (como OpenRouter): rechazada por requisito explícito de seguridad.
  - `tauri-plugin-stronghold`: vault cifrado con contraseña maestra; más fricción para el usuario y más configuración. Rechazada por simplicidad.
- **Consecuencia**: la key sigue expuesta en memoria del webview durante la llamada; ver Riesgos.

### 3. El modelo (no secreto) se persiste en `localStorage`

Igual que Ollama/OpenRouter, el nombre del modelo se guarda con `useLocalStorage` en `settings-google-model` (por defecto `gemini-2.0-flash`). Solo la API key usa el llavero.

### 4. La selección de proveedor amplía el tipo existente

En `FabAi.tsx`, el tipo `ProviderOption` pasa a `'ollama' | 'openrouter' | 'google'` y `settings-model-source` acepta el nuevo valor. Al elegir Google se usa `settings-google-model` y la key obtenida del llavero.

### 5. UI de configuración coherente con las pestañas existentes

Se crea `GoogleTab.tsx` replicando la estructura de `OpenRouterTab.tsx` (componentes `Field`/`Input`), añadiendo la carga/guardado asíncrono de la key vía `invoke`. Se registra una nueva pestaña `google` en `SettingsDialog/index.tsx` y sus claves i18n (`tab-google`, `field-google-api-key`, `field-google-model`, etc.) en ambos diccionarios.

### 6. El selector de modelo usa autocompletado y se deshabilita sin API key

El campo de modelo de Google se implementa como un autocompletado (mismo patrón que `OllamaTab.tsx`: `Input` + desplegable de sugerencias). Los modelos se obtienen con `listGoogleModels(apiKey)` (`ai.models.list()`, filtrando por `supportedActions.includes("generateContent")` y quitando el prefijo `models/`). El fetch se debuja y solo se dispara cuando hay API key; mientras no la haya o no se haya cargado, el campo aparece `disabled` y no muestra sugerencias.

- **Alternativas consideradas**: `react-select` (ya es dependencia). Rechazada para mantener coherencia visual con `OllamaTab`.
- **Trade-off**: `ai.models.list()` se llama al llavero/red tras cada escritura; se mitiga con un debounce.

### 7. Generación de listado de snippets al crear un archivo nuevo

Se amplía `CreateFile.tsx` para solicitar a la IA un listado de snippets:
- Campo de descripción (textarea) y campo de prefijo común (input).
- Si la descripción está vacía, el archivo se crea directamente con `{}` sin invocar Gemini.
- Si hay descripción, se llama a `generateGoogleSnippetList(prompt, model, apiKey)` que usa `GoogleGenAI` con `responseMimeType: 'application/json'` y `responseSchema` de tipo `ARRAY` de objetos snippet (`name`, `prefix`, `body`, `description`, `scope`).
- El prompt combina la descripción con la instrucción de usar el prefijo común como base, añadiendo sufijos únicos.
- Los resultados se convierten a mapa de snippets estilo VS Code (`{ [nombre]: { prefix, body, description, scope, isFileTemplate: false } }`) y se devuelven como `content` en la respuesta del diálogo.
- `FilesDrawer` usa ese `content` al escribir el archivo nuevo.

- **Alternativas consideradas**: generar la lista en `FilesDrawer` (en lugar del diálogo). Rechazada para mantener el flujo react-confirm autocontenido y simplificar el manejo de errores/carga.
- **Provider**: solo Google (Gemini) según la decisión del usuario.

## Risks / Trade-offs

- **La API key se carga en memoria del webview** (para pasarla al SDK) → Mitigación: obtenerla solo en el momento de uso, no registrarla en logs ni persistirla en `localStorage`; el almacenamiento en reposo queda protegido por el llavero del SO.
- **`keyring` no disponible en algunos entornos Linux** (sin Secret Service) → Mitigación: los comandos devuelven `Result` con mensaje y la UI muestra el error; la app sigue funcionando con los otros proveedores.
- **Configuración de features de `keyring` por plataforma** (Windows/macOS/Linux) → Mitigación: habilitar en `Cargo.toml` las features nativas necesarias y verificar el build en Windows (plataforma actual).
- **El SDK `@google/genai` añade peso al bundle y hace peticiones de red desde el webview** → Mitigación: CSP ya está deshabilitada, por lo que no requiere cambios de configuración de seguridad; la API de Gemini soporta CORS.
- **Falta de API key o modelo inválido** → Mitigación: validar antes de llamar y notificar al usuario (ver escenarios del spec).

## Migration Plan

- No hay migración de datos: es un proveedor nuevo. Los usuarios sin API key de Google ven el campo vacío y no ven afectados Ollama/OpenRouter.
- Rollback: eliminar la pestaña, la opción de proveedor y las dependencias nuevas; el llavero puede quedar con la entrada, que se puede borrar manualmente o con un comando de borrado opcional.
