use std::sync::Mutex;

use hotwatch::Hotwatch;
use tauri::AppHandle;

// https://github.com/tauri-apps/tauri/discussions/5111
// https://programwiz.org/2022/05/16/tauri-state-variable/
pub struct MonitorHandlerManager {
    mut_monitor_handler: Mutex<MonitorHandler>,
}

impl MonitorHandlerManager {
    pub fn new(mut_monitor_handler: MonitorHandler) -> Self {
        Self {
            mut_monitor_handler: Mutex::new(mut_monitor_handler),
        }
    }
    pub fn get_app_handler(&self) -> Result<AppHandle, String> {
        let monitor_handler = self.mut_monitor_handler.lock().unwrap();
        let app_hanler = monitor_handler.app_handler.clone().unwrap();
        Ok(app_hanler)
    }
}

pub struct MonitorHandler {
    pub watcher: Hotwatch,
    pub app_handler: Option<AppHandle>,
}
impl MonitorHandler {
    pub fn new(watcher: Hotwatch, app_handler: Option<AppHandle>) -> Self {
        Self {
            watcher: watcher,
            app_handler: app_handler,
        }
    }
}
