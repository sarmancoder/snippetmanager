# Tasks

## 1. Dependencias y almacenamiento seguro (backend)

- [x] 1.1 Añadir `@google/genai` a `package.json` y verificar que la instalación actualiza `pnpm-lock.yaml` sin errores (`pnpm install`)
- [x] 1.2 Añadir el crate `keyring` a `src-tauri/Cargo.toml` con las features nativas por plataforma y verificar que compila (`cargo check` desde `src-tauri`)
- [x] 1.3 Implementar los comandos `save_google_api_key(api_key)` y `get_google_api_key()` en Rust usando `keyring` con servicio y cuenta fijos, y registrarlos en `src-tauri/src/lib.rs`; verificar la compilación con `cargo check`
- [x] 1.4 Verificar el ciclo guardar/recuperar invocando ambos comandos (guardar una key, leerla y comprobar que coincide) y confirmar que la entrada se crea en el llavero del sistema operativo

## 2. Módulo de generación con Gemini (frontend)

- [x] 2.1 Crear `src/lib/ai/google.ts` que construya el cliente `GoogleGenAI` y exponga una función que reciba `prompt`, `model` y `apiKey` y devuelva `response.text`, aplicando la misma instrucción de sistema que los otros proveedores, `temperature: 0.1`, `responseMimeType: "application/json"` y un `responseSchema` con los campos `name`, `prefix`, `body` (array de strings), `description` y `scope` usando `Type.STRING`/`Type.ARRAY`; verificar que no hay errores de tsc en los archivos del cambio
- [ ] 2.2 Verificar manualmente que una llamada de prueba con una API key válida devuelve el texto del snippet y que sin key se produce un error controlado

## 3. Pestaña de configuración Google

- [x] 3.1 Crear `src/dialogs/SettingsDialog/GoogleTab.tsx` con un campo de API key que carga/guarda vía `invoke` y un campo de modelo persistido en `settings-google-model` (por defecto `gemini-2.0-flash`); verificar que `pnpm build` pasa
- [x] 3.2 Registrar la pestaña Google en `SettingsDialog/index.tsx` y añadir las claves i18n en `src/messages/es-ES.ts` y `src/messages/en-UK.ts`; verificar que la pestaña aparece y sus textos se traducen en ambos idiomas
- [x] 3.3 Documentar en el `README.md` la configuración del proveedor Google (API key en el llavero, selección de modelo) y verificar que el texto coincide con la UI real
- [x] 3.4 Añadir `listGoogleModels(apiKey)` a `src/lib/ai/google.ts` que use `ai.models.list()`, filtre por `supportedActions.includes("generateContent")` y quite el prefijo `models/`; verificar que no hay errores de tsc en los archivos del cambio
- [x] 3.5 Convertir el campo de modelo de `GoogleTab.tsx` en un autocompletado con desplegable de modelos (con debounce al cargar), deshabilitado mientras no haya API key o no se haya cargado; verificar que no hay errores de tsc en los archivos del cambio

## 4. Integración en el asistente IA

- [x] 4.1 Ampliar `ProviderOption` a `'google'` en `src/components/layout/FabAi.tsx`, añadir la opción "Google" a `MODEL_OPTIONS` y enrutar la generación a `src/lib/ai/google.ts` usando `settings-google-model` y la key del llavero; verificar que `pnpm build` pasa
- [ ] 4.2 Verificar manualmente que al seleccionar Google el modelo activo mostrado es el de Google y que "Reemplazar"/"Modificar" insertan el resultado en el editor

## 5. Verificación de integración

- [ ] 5.1 Verificar de extremo a extremo en `pnpm tauri dev` que cada proveedor (Ollama, OpenRouter, Google) genera o falla de forma controlada según su configuración
- [ ] 5.2 Confirmar que la API key de Google no aparece en `localStorage` (inspeccionando el almacenamiento del webview) y que se recupera correctamente tras reiniciar la aplicación

## Workflow follow-up

- Archivar el cambio tras cumplir los requisitos de revisión del proyecto.
- Verificar el resultado archivado.
