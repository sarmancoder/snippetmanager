mod ai;

use ai::{list_ollama_models, stream_ollama_prompt, stream_openrouter_prompt};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            list_ollama_models,
            stream_openrouter_prompt,
            stream_ollama_prompt
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}