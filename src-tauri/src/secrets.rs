use keyring::Entry;

const SERVICE: &str = "com.sarma.snippetmanager";
const GOOGLE_ACCOUNT: &str = "google-api-key";

fn google_entry() -> Result<Entry, String> {
    Entry::new(SERVICE, GOOGLE_ACCOUNT)
        .map_err(|e| format!("Error al acceder al llavero del sistema: {}", e))
}

#[tauri::command]
pub fn save_google_api_key(api_key: String) -> Result<(), String> {
    let entry = google_entry()?;
    entry
        .set_password(&api_key)
        .map_err(|e| format!("Error al guardar la API key de Google: {}", e))
}

#[tauri::command]
pub fn get_google_api_key() -> Result<Option<String>, String> {
    let entry = google_entry()?;
    match entry.get_password() {
        Ok(secret) => Ok(Some(secret)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Error al recuperar la API key de Google: {}", e)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn google_api_key_round_trip() {
        let entry = google_entry().expect("no se pudo abrir la entrada del llavero");
        let previous = entry.get_password().ok();

        save_google_api_key("test-google-api-key".to_string()).expect("no se pudo guardar la key");
        let fetched = get_google_api_key().expect("no se pudo leer la key");
        assert_eq!(fetched.as_deref(), Some("test-google-api-key"));

        match previous {
            Some(value) => {
                let _ = entry.set_password(&value);
            }
            None => {
                let _ = entry.delete_credential();
            }
        }
    }
}
