use std::env::Args;

use hbb_common::log;

// shared by flutter and sciter main function
pub fn core_main() -> Option<Vec<String>> {
    // https://docs.rs/flexi_logger/latest/flexi_logger/error_info/index.html#write
    // though async logger more efficient, but it also causes more problems, disable it for now
    // let mut _async_logger_holder: Option<flexi_logger::LoggerHandle> = None;
    let mut args = Vec::new();
    let mut flutter_args = Vec::new();
    let mut i = 0;
    let mut is_setup = false;
    let mut _is_elevate = false;
    let mut _is_run_as_system = false;
    let mut _is_flutter_connect = false;
    for arg in std::env::args() {
        // to-do: how to pass to flutter?
        if i == 0 && crate::common::is_setup(&arg) {
            is_setup = true;
        } else if i > 0 {
            #[cfg(feature = "flutter")]
            if arg == "--connect" {
                _is_flutter_connect = true;
            }
            if arg == "--elevate" {
                _is_elevate = true;
            } else if arg == "--run-as-system" {
                _is_run_as_system = true;
            } else {
                args.push(arg);
            }
        }
        i += 1;
    }
    if args.contains(&"--install".to_string()) {
        is_setup = true;
    }
    #[cfg(feature = "flutter")]
    if _is_flutter_connect {
        return core_main_invoke_new_connection(std::env::args());
    }
    if args.contains(&"--install".to_string()) {
        is_setup = true;
    }
    if is_setup {
        if args.is_empty() {
            args.push("--install".to_owned());
            flutter_args.push("--install".to_string());
        }
    }
    if args.contains(&"--noinstall".to_string()) {
        args.clear();
    }
    if args.len() > 0 && args[0] == "--version" {
        println!("{}", crate::VERSION);
        return None;
    }
    #[cfg(debug_assertions)]
    {
        use hbb_common::env_logger::{Env, init_from_env, DEFAULT_FILTER_ENV};
        init_from_env(Env::default().filter_or(DEFAULT_FILTER_ENV, "info"));
    }
    #[cfg(not(debug_assertions))]
    {
        let mut path = hbb_common::config::Config::log_path();
        if args.len() > 0 && args[0].starts_with("--") {
            let name = args[0].replace("--", "");
            if !name.is_empty() {
                path.push(name);
            }
        }
        use flexi_logger::*;
        if let Ok(x) = Logger::try_with_env_or_str("debug") {
            // _async_logger_holder =
            x.log_to_file(FileSpec::default().directory(path))
                //.write_mode(WriteMode::Async)
                .format(opt_format)
                .rotate(
                    Criterion::Age(Age::Day),
                    Naming::Timestamps,
                    Cleanup::KeepLogFiles(6),
                )
                .start()
                .ok();
        }
    }
    if args.is_empty() {
        std::thread::spawn(move || crate::start_server(false));
    } else {
        #[cfg(windows)]
        {
            use crate::platform;
            if args[0] == "--uninstall" {
                if let Err(err) = platform::uninstall_me() {
                    log::error!("Failed to uninstall: {}", err);
                }
                return None;
            } else if args[0] == "--after-install" {
                if let Err(err) = platform::run_after_install() {
                    log::error!("Failed to after-install: {}", err);
                }
                return None;
            } else if args[0] == "--before-uninstall" {
                if let Err(err) = platform::run_before_uninstall() {
                    log::error!("Failed to before-uninstall: {}", err);
                }
                return None;
            } else if args[0] == "--update" {
                hbb_common::allow_err!(platform::update_me());
                return None;
            } else if args[0] == "--reinstall" {
                hbb_common::allow_err!(platform::uninstall_me());
                hbb_common::allow_err!(platform::install_me(
                    "desktopicon startmenu",
                    "".to_owned(),
                    false,
                    false,
                ));
                return None;
            } else if args[0] == "--silent-install" {
                hbb_common::allow_err!(platform::install_me(
                    "desktopicon startmenu",
                    "".to_owned(),
                    true,
                    args.len() > 1,
                ));
                return None;
            } else if args[0] == "--extract" {
                #[cfg(feature = "with_rc")]
                hbb_common::allow_err!(crate::rc::extract_resources(&args[1]));
                return None;
            } else if args[0] == "--tray" {
                crate::tray::start_tray(crate::ui_interface::OPTIONS.clone());
                return None;
            }
        }
        if args[0] == "--remove" {
            if args.len() == 2 {
                // sleep a while so that process of removed exe exit
                std::thread::sleep(std::time::Duration::from_secs(1));
                std::fs::remove_file(&args[1]).ok();
                return None;
            }
        } else if args[0] == "--service" {
            log::info!("start --service");
            crate::start_os_service();
            return None;
        } else if args[0] == "--server" {
            log::info!("start --server");
            #[cfg(not(target_os = "macos"))]
            {
                crate::start_server(true);
                return None;
            }
            #[cfg(target_os = "macos")]
            {
                std::thread::spawn(move || crate::start_server(true));
                // to-do: for flutter, starting tray not ready yet, or we can reuse sciter's tray implementation.
            }
        } else if args[0] == "--import-config" {
            if args.len() == 2 {
                let filepath;
                let path = std::path::Path::new(&args[1]);
                if !path.is_absolute() {
                    let mut cur = std::env::current_dir().unwrap();
                    cur.push(path);
                    filepath = cur.to_str().unwrap().to_string();
                } else {
                    filepath = path.to_str().unwrap().to_string();
                }
                import_config(&filepath);
            }
            return None;
        } else if args[0] == "--password" {
            if args.len() == 2 {
                crate::ipc::set_permanent_password(args[1].to_owned()).unwrap();
            }
            return None;
        } else if args[0] == "--check-hwcodec-config" {
            #[cfg(feature = "hwcodec")]
            scrap::hwcodec::check_config();
            return None;
        } else if args[0] == "--cm" {
            // call connection manager to establish connections
            // meanwhile, return true to call flutter window to show control panel
            #[cfg(feature = "flutter")]
            crate::flutter::connection_manager::start_listen_ipc_thread();
        }
    }
    //_async_logger_holder.map(|x| x.flush());
    #[cfg(feature = "flutter")]
    return Some(flutter_args);
    #[cfg(not(feature = "flutter"))]
    return Some(args);
}

fn import_config(path: &str) {
    use hbb_common::{config::*, get_exe_time, get_modified_time};
    let path2 = path.replace(".toml", "2.toml");
    let path2 = std::path::Path::new(&path2);
    let path = std::path::Path::new(path);
    log::info!("import config from {:?} and {:?}", path, path2);
    let config: Config = load_path(path.into());
    if config.is_empty() {
        log::info!("Empty source config, skipped");
        return;
    }
    if get_modified_time(&path) > get_modified_time(&Config::file())
        && get_modified_time(&path) < get_exe_time()
    {
        if store_path(Config::file(), config).is_err() {
            log::info!("config written");
        }
    }
    let config2: Config2 = load_path(path2.into());
    if get_modified_time(&path2) > get_modified_time(&Config2::file()) {
        if store_path(Config2::file(), config2).is_err() {
            log::info!("config2 written");
        }
    }
}

/// invoke a new connection
///
/// [Note]
/// this is for invoke new connection from dbus.
#[cfg(feature = "flutter")]
fn core_main_invoke_new_connection(mut args: Args) -> Option<Vec<String>> {
    args.position(|element| {
        return element == "--connect";
    })
    .unwrap();
    let peer_id = args.next().unwrap_or("".to_string());
    if peer_id.is_empty() {
        eprintln!("please provide a valid peer id");
        return None;
    }
    #[cfg(target_os = "linux")]
    {
        use crate::dbus::invoke_new_connection;

        match invoke_new_connection(peer_id) {
            Ok(()) => {
                return None;
            }
            Err(err) => {
                log::error!("{}", err.as_ref());
                // return Some to invoke this new connection by self
                return Some(Vec::new());
            }
        }
    }
    return None;
}
