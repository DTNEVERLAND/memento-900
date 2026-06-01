// Memento 900 — Tauri desktop entry point.
// The SQL plugin persists app data to a real SQLite file on the user's disk
// (resolved under the OS app-data dir), so records survive cache clears,
// reboots, and never touch any server.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running Memento 900");
}
