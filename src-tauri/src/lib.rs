// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_snippets_folder() -> String {
    #[cfg(target_os = "windows")]
    {
        if let Some(appdata) = std::env::var("APPDATA").ok() {
            return format!("{}\\Code\\User\\snippets", appdata);
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        if let Some(home) = std::env::var("HOME").ok() {
            return format!("{}/Library/Application Support/Code/User/snippets", home);
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        if let Some(home) = std::env::var("HOME").ok() {
            return format!("{}/.config/Code/User/snippets", home);
        }
    }
    
    String::new()
}

use serde::Serialize;

#[derive(Serialize)]
struct SnippetsResult {
    path: String,
    files: Vec<String>,
}

#[tauri::command]
fn get_snippet_files() -> SnippetsResult {
    let folder = get_snippets_folder();
    if folder.is_empty() {
        return SnippetsResult { path: String::new(), files: vec![] };
    }

    let mut files = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&folder) {
        for entry in entries.flatten() {
            if let Ok(ft) = entry.file_type() {
                if ft.is_file() {
                    if let Some(name) = entry.file_name().to_str() {
                        if name.ends_with(".code-snippets") {
                            files.push(name.to_string());
                        }
                    }
                }
            }
        }
    }

    SnippetsResult { path: folder, files }
}




#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_snippet_files, open_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_folder(path: &str) -> Result<(), String> {
    if path.is_empty() {
        return Err("empty path".into());
    }

    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        Command::new("explorer")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
        return Ok(());
    }

    Err("unsupported platform".into())
}
