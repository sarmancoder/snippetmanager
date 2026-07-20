use reqwest::Client;
use serde_json::{json, Value}; // 👈 CORRECCIÓN: Añadido 'Value' aquí
use tauri::{AppHandle};

#[tauri::command]
// 👈 CORRECCIÓN: Cambiado Result<(), String> por Result<String, String>
pub async fn stream_ollama_prompt(app_handle: AppHandle, prompt: String, model: String) -> Result<String, String> {
    let client = Client::builder()
        .no_proxy()
        .build()
        .map_err(|e| format!("Error al configurar cliente HTTP: {}", e))?;

    let payload = json!({
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "Eres un asistente experto en desarrollo de software. Tu única tarea es generar snippets de Visual Studio Code en formato JSON estricto. NO incluyas introducciones, NO incluyas explicaciones, NO uses bloques de código Markdown (```json). Devuelve exclusivamente el objeto JSON del snippet."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "options": {
            "temperature": 0.1
        },
        "format": "json",
        "stream": false 
    });

    // 3. Enviamos la petición y esperamos la respuesta completa
    let response = client
        .post("http://127.0.0.1:11434/api/chat")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Error al conectar con Ollama: {}", e))?;

    // 4. Parseamos el cuerpo completo de la respuesta como JSON
    let response_json: Value = response
        .json()
        .await
        .map_err(|e| format!("Error al leer la respuesta de Ollama: {}", e))?;

    // 5. Extraemos el texto acumulado que Ollama guardó en "message" -> "content"
    let content = response_json["message"]["content"]
        .as_str()
        .ok_or("No se encontró el campo 'content' en la respuesta")?
        .to_string();

    // Retornamos directamente el JSON en texto al frontend
    Ok(content)
}