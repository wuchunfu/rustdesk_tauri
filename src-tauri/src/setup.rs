


use crate::{
    core_main,
    ui_tauri,
};

pub fn setup(app: &tauri::AppHandle) {
    
    if let Some(args) = core_main::core_main().as_mut(){
        ui_tauri::start(app, args);
    }
}