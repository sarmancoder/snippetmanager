# Spec Delta

## Purpose

Permitir que la aplicación genere el contenido de snippets mediante distintos proveedores de IA (Ollama, OpenRouter y Google Gemini), que el usuario seleccione y configure el proveedor, y que las credenciales se almacenen de forma segura.

## ADDED Requirements

### Requirement: Selección de proveedor de IA
El sistema DEBE (MUST) permitir al usuario elegir, en el asistente de IA, la fuente del modelo entre Ollama, OpenRouter y Google Gemini.

#### Scenario: Seleccionar Google como fuente
- **WHEN** el usuario marca "Google" como fuente del modelo
- **THEN** el asistente utiliza el modelo y la credencial de Google configurados en los ajustes al generar contenido

#### Scenario: Mostrar modelo activo
- **WHEN** el usuario cambia la fuente del modelo
- **THEN** el asistente muestra el modelo activo correspondiente al proveedor seleccionado

### Requirement: Configuración del proveedor Google
El sistema DEBE (MUST) ofrecer una sección de configuración de Google con un campo para la API key y un campo para el nombre del modelo, y DEBE recordar el modelo seleccionado entre sesiones.

#### Scenario: Guardar configuración de Google
- **WHEN** el usuario introduce una API key y un modelo en la pestaña Google y guarda
- **THEN** el modelo queda recordado para futuras sesiones y la API key queda almacenada de forma segura

#### Scenario: Valor por defecto del modelo
- **WHEN** el usuario abre la pestaña Google sin haber configurado un modelo
- **THEN** el campo de modelo muestra un valor por defecto

### Requirement: Selección de modelo de Google con autocompletado
El sistema DEBE (MUST) ofrecer un selector de modelo con autocompletado que recupere los modelos disponibles de Google cuando haya una API key configurada, y DEBE mostrarlo deshabilitado mientras no haya API key.

#### Scenario: Autocompletado de modelos disponibles
- **WHEN** el usuario tiene una API key de Google configurada y enfoca o escribe en el campo de modelo
- **THEN** el sistema recupera y muestra la lista de modelos disponibles para seleccionarlos fácilmente

#### Scenario: Selector deshabilitado sin API key
- **WHEN** no hay una API key de Google configurada
- **THEN** el selector de modelo aparece deshabilitado

### Requirement: Generación de un listado de snippets al crear un archivo
El sistema DEBE (MUST) ofrecer, en el diálogo de creación de archivo nuevo, un campo para describir los snippets deseados, un campo para indicar un prefijo común y generar con Google Gemini un listado de snippets que se escriba como contenido del archivo creado. Si la descripción está vacía, el archivo DEBE crearse vacío.

#### Scenario: Generación de listado con descripción y API key
- **WHEN** el usuario proporciona una descripción, un prefijo común y hay una API key de Google configurada
- **THEN** el sistema genera un array de snippets usando el prefijo indicado como base (añadiendo un sufijo único) y guarda el resultado como contenido del archivo nuevo

#### Scenario: Error sin API key
- **WHEN** el usuario solicita generar un listado pero no hay una API key de Google configurada
- **THEN** el sistema muestra un error y no genera contenido

#### Scenario: Creación vacía sin descripción
- **WHEN** la descripción está vacía
- **THEN** el archivo se crea con contenido `{}` sin llamar a la IA

### Requirement: Almacenamiento seguro de la API key de Google
El sistema DEBE (MUST) almacenar la API key de Google en el almacén de credenciales del sistema operativo y NO DEBE persistirla en localStorage ni en otros almacenes de texto plano.

#### Scenario: Guardar la API key de forma segura
- **WHEN** el usuario guarda la API key de Google
- **THEN** la clave se escribe en el almacén de credenciales del sistema operativo y no aparece en localStorage

#### Scenario: Recuperar la API key guardada
- **WHEN** el usuario abre la pestaña Google tras haber guardado una API key
- **THEN** el sistema recupera la clave desde el almacén de credenciales del sistema operativo

#### Scenario: Sin API key guardada
- **WHEN** el usuario abre la pestaña Google sin una API key almacenada
- **THEN** el campo se muestra vacío y el sistema no genera contenido con Google hasta que se configure una clave

### Requirement: Generación de snippets con Google Gemini
El sistema DEBE (MUST) generar el contenido del snippet usando la API de Google Gemini con la API key y el modelo configurados, aplicando una instrucción de sistema equivalente a la de los otros proveedores y solicitando salida en formato JSON conforme al esquema de snippet.

#### Scenario: Generación exitosa
- **WHEN** el usuario envía una solicitud con Google seleccionado, una API key válida y un modelo válido
- **THEN** el sistema devuelve el contenido generado por el modelo para insertarlo en el editor

#### Scenario: Salida estructurada del snippet
- **WHEN** el modelo devuelve el contenido con Google seleccionado
- **THEN** el resultado respeta el esquema de snippet con los campos `name`, `prefix`, `body` (lista de líneas), `description` y `scope`

#### Scenario: API key ausente
- **WHEN** el usuario envía una solicitud con Google seleccionado pero sin API key configurada
- **THEN** el sistema no realiza la llamada y notifica al usuario que falta la API key

#### Scenario: Error del proveedor
- **WHEN** la API de Gemini devuelve un error o falla la conexión
- **THEN** el sistema no modifica el contenido del editor y muestra o registra el error
