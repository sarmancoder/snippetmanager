use serde::Serialize;

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

#[derive(Serialize)]
struct SnippetsResult {
    path: String,
    files: Vec<String>,
}

#[tauri::command]
fn get_snippet_files(folder: String) -> SnippetsResult {
    let folder = if folder.is_empty() {
        get_snippets_folder()
    } else {
        folder
    };
    if folder.is_empty() {
        return SnippetsResult {
            path: String::new(),
            files: vec![],
        };
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

    SnippetsResult {
        path: folder,
        files,
    }
}

#[tauri::command]
fn select_directory() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let dir = rfd::FileDialog::new()
        .set_title("Select a directory")
        .pick_folder();

    match dir {
        Some(path_buf) => {
            let path_str = path_buf.to_string_lossy().into_owned();
            return Ok(path_str); // <-- Ponle 'return' aquí
        }
        None => {
            return Err("No directory selected".into()); // <-- Y 'return' aquí
        }
    }
    }

    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let output = Command::new("osascript")
            .arg("-e")
            .arg("POSIX path of (choose folder with prompt \"Select a directory:\")")
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            let path = String::from_utf8(output.stdout)
                .map_err(|e| e.to_string())?
                .trim()
                .to_string();
            return Ok(path);
        }
        return Err("No directory selected".into());
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;
        let output = Command::new("zenity")
            .args(&[
                "--file-selection",
                "--directory",
                "--title=Select a directory",
            ])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            let path = String::from_utf8(output.stdout)
                .map_err(|e| e.to_string())?
                .trim()
                .to_string();
            return Ok(path);
        }
        return Err("No directory selected".into());
    }

    Err("unsupported platform".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_snippet_files,
            select_directory,
            open_folder
        ])
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
