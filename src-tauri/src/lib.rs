mod fsfunctions;

use fsfunctions::open_folder; // <--- AGREGA ESTA LÍNEA
use fsfunctions::get_snippet_files; // <--- AGREGA ESTA LÍNEA
use fsfunctions::select_directory; // <--- AGREGA ESTA LÍNEA
use fsfunctions::read_file; // <--- AGREGA ESTA LÍNEA

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_snippet_files,
            select_directory,
            read_file,
            open_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}