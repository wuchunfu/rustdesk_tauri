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

fn main() {
    println!("{}", !has_feature("custom-protocol"));
    let mut builder = tauri::Builder::default();
    builder = invoke_handler(builder);
    builder
        .setup(|app| {
            setup::setup(&app.handle());
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
