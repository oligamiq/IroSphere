use crate::handler::MonitorHandlerManager;
use tauri::api::dialog::FileDialogBuilder;
use tauri::{Manager, State};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[tauri::command]
pub fn open_file_dialog(monitor_handle_manager: State<'_, MonitorHandlerManager>) {
    // https://qiita.com/hyaguchi947d/items/77f41571126c8cb9d326

    let app_handle = monitor_handle_manager.get_app_handler();

    FileDialogBuilder::new().pick_files(move |file_paths| {
        match file_paths {
            Some(v) => {
                let mut pathstr = "".to_string();
                // 選択されたファイルのうち最初のファイルだけを対象とする
                match v.first() {
                    Some(path) => match path.to_str() {
                        Some(s) => {
                            println!("{:?}", s);
                            pathstr = s.to_string();
                        }
                        _ => {}
                    },
                    _ => {}
                }
                match app_handle {
                    Ok(v) => {
                        let _ = v.emit_all("img_load", Payload { message: pathstr });
                    }
                    _ => {}
                }
            }
            _ => {}
        };
    });
}
