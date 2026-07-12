use serde::Serialize;

#[tauri::command]
pub fn get_snippets_folder() -> String {
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
pub struct SnippetsResult {
    pub path: String,
    pub files: Vec<String>,
}

#[tauri::command]
pub fn get_snippet_files(folder: String) -> Result<SnippetsResult, String> { // 2. Devolvemos un Result
    let folder = if folder.is_empty() {
        get_snippets_folder()
    } else {
        folder
    };

    if folder.is_empty() {
        // En Rust, usamos Ok(...) para indicar que la función terminó con éxito
        return Ok(SnippetsResult {
            path: String::new(),
            files: vec![],
        });
    }

    // --- Aquí continuaría tu lógica para leer los archivos de la carpeta ---
    // Por ejemplo:
    let mut files = vec![];
    if let Ok(entries) = std::fs::read_dir(&folder) {
        for entry in entries.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                files.push(name.to_string());
            }
        }
    }

    // Al final, devuelves el resultado envuelto en Ok
    Ok(SnippetsResult {
        path: folder,
        files,
    })
}

#[tauri::command]
pub fn select_directory() -> Result<String, String> {
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

#[tauri::command]
pub fn open_folder(path: &str) -> Result<(), String> {
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

#[tauri::command]
pub fn read_file(path: &str, filename: &str) -> Result<String, String> {
    if path.is_empty() || filename.is_empty() {
        return Err("empty path or filename".into());
    }

    let full_path = std::path::Path::new(path).join(filename);
    std::fs::read_to_string(full_path).map_err(|e| e.to_string())
}


