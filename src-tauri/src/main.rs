// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod handler;

use crate::handler::MonitorHandler;
use handler::MonitorHandlerManager;
use hotwatch::Hotwatch;
use tauri::Manager;

mod file_open;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// static GLOBAL_APP: OnceCell<&mut App> = OnceCell::new();

fn main() {
    tauri::Builder::default()
        .setup(move |app| {
            let handle = app.handle();
            let monitor = Hotwatch::new().expect("failed to initialize monitor_handler");
            let monitor_handler = MonitorHandler::new(monitor, Some(handle));
            app.manage(MonitorHandlerManager::new(monitor_handler));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, file_open::open_file_dialog])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
