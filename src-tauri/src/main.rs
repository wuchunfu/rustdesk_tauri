#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use hbb_common::log;
use librustdesk::{
    setup,
    invoke_handler::invoke_handler,
};
use tauri::{GlobalShortcutManager, Manager};

fn create_main_window(app: &tauri::AppHandle) -> tauri::Window {
    tauri::Window::builder(app, "main", tauri::WindowUrl::App("index.html".into()))
        .title("Manuspect")
        .inner_size(700f64, 600f64)
        .center()
        .build()
        .unwrap()
}

fn main() {
    println!("{}", !has_feature("custom-protocol"));
    let mut builder = tauri::Builder::default();
    builder = invoke_handler(builder);
    builder
    .system_tray(
        tauri::SystemTray::new().with_menu(
            tauri::SystemTrayMenu::new()
                .add_item(tauri::CustomMenuItem::new("toggle".to_string(), "Hide"))
                .add_native_item(tauri::SystemTrayMenuItem::Separator)
                .add_item(tauri::CustomMenuItem::new("quit", "Quit")),
        ),
    )
    .on_system_tray_event(move |app, event| match event {
        tauri::SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a left click");
        }
        tauri::SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            let window = app.get_window("main").unwrap();
            // update dashboard menu text
            if window.is_visible().unwrap() {
                app.tray_handle()
                    .get_item("toggle")
                    .set_title("Hide")
                    .unwrap();
            } else {
                app.tray_handle()
                    .get_item("toggle")
                    .set_title("Show")
                    .unwrap();
            }
            println!("system tray received a right click");
        }
        tauri::SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a double click");
        }
        tauri::SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "quit" => {
                    let app = app.clone();
                    std::thread::spawn(move || app.exit(0));
                }
                "toggle" => {
                    let window = app.get_window("main").unwrap();
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                    }
                }
                _ => {}
            }
        }
        _ => todo!(),
    })
    .setup(|app| {
        setup::setup(&app.handle());
        create_main_window(&app.handle());
        app.get_window("main").unwrap().open_devtools();
        Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while running tauri application")
    .run(|_app_handle, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            log::info!("exit requested");
            api.prevent_exit();
        }
        _ => {}
    });
}

// checks if the given Cargo feature is enabled.
fn has_feature(feature: &str) -> bool {
    use heck::AsShoutySnakeCase;
    // when a feature is enabled, Cargo sets the `CARGO_FEATURE_<name` env var to 1
    // https://doc.rust-lang.org/cargo/reference/environment-variables.html#environment-variables-cargo-sets-for-build-scripts
    std::env::var(format!("CARGO_FEATURE_{}", AsShoutySnakeCase(feature)))
        .map(|x| x == "1")
        .unwrap_or(false)
}
