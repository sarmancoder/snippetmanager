mod fsfunctions;

use fsfunctions::open_folder;
use fsfunctions::get_snippet_files;
use fsfunctions::get_snippets_folder;
use fsfunctions::select_directory;
use fsfunctions::read_file;
use fsfunctions::write_file;
use fsfunctions::delete_file;

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
            get_snippets_folder,
            select_directory,
            read_file,
            open_folder,
            write_file,
            delete_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}