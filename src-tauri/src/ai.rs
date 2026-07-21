use reqwest::Client;
use serde_json::{json, Value};
use tauri::AppHandle;

#[tauri::command]
pub async fn list_ollama_models(base_url: String) -> Result<Vec<String>, String> {
    let normalized_base_url = base_url.trim_end_matches('/').to_string();
    let endpoint = format!("{}/api/tags", normalized_base_url);

    let client = Client::builder()
        .no_proxy()
        .build()
        .map_err(|e| format!("Error al configurar cliente HTTP: {}", e))?;

    let response = client
        .get(&endpoint)
        .send()
        .await
        .map_err(|e| format!("Error al conectar con Ollama: {}", e))?;

    let response_json: Value = response
        .json()
        .await
        .map_err(|e| format!("Error al leer los modelos de Ollama: {}", e))?;

    let models = response_json["models"]
        .as_array()
        .ok_or("No se encontró la lista de modelos en la respuesta")?;

    let mut model_names = Vec::new();
    for model in models {
        if let Some(name) = model.get("name").and_then(Value::as_str) {
            model_names.push(name.to_string());
        }
    }

    Ok(model_names)
}

#[tauri::command]
pub async fn stream_openrouter_prompt(prompt: String, model: String, api_key: String) -> Result<String, String> {
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
        "temperature": 0.1
    });

    let response = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("HTTP-Referer", "http://localhost")
        .header("X-Title", "Snippet Manager")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Error al conectar con OpenRouter: {}", e))?;

    let response_json: Value = response
        .json()
        .await
        .map_err(|e| format!("Error al leer la respuesta de OpenRouter: {}", e))?;

    let content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("No se encontró el campo 'content' en la respuesta")?
        .to_string();

    Ok(content)
}

#[tauri::command]
pub async fn stream_ollama_prompt(_app_handle: AppHandle, prompt: String, model: String) -> Result<String, String> {
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