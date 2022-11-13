use std::{
    collections::HashMap,
    process::Child,
    sync::{Arc, Mutex},
    time::SystemTime,
};

#[cfg(any(target_os = "android", target_os = "ios"))]
use hbb_common::password_security;
use hbb_common::{
    allow_err,
    config::{self, Config, LocalConfig, PeerConfig, RENDEZVOUS_PORT, RENDEZVOUS_TIMEOUT},
    directories_next,
    futures::future::join_all,
    log,
    protobuf::Message as _,
    rendezvous_proto::*,
    sleep,
    tcp::FramedStream,
    tokio::{self, sync::mpsc, time},
};

use crate::ipc;
use crate::{common::SOFTWARE_UPDATE_URL, platform};

type Message = RendezvousMessage;

pub type Childs = Arc<Mutex<(bool, HashMap<(String, String), Child>)>>;
type Status = (i32, bool, i64, String); // (status_num, key_confirmed, mouse_time, id)

lazy_static::lazy_static! {
    pub static ref CHILDS : Childs = Default::default();
    pub static ref UI_STATUS : Arc<Mutex<Status>> = Arc::new(Mutex::new((0, false, 0, "".to_owned())));
    pub static ref OPTIONS : Arc<Mutex<HashMap<String, String>>> = Arc::new(Mutex::new(Config::get_options()));
    pub static ref ASYNC_JOB_STATUS : Arc<Mutex<String>> = Default::default();
    pub static ref TEMPORARY_PASSWD : Arc<Mutex<String>> = Arc::new(Mutex::new("".to_owned()));
}

#[cfg(not(any(target_os = "android", target_os = "ios")))]
lazy_static::lazy_static! {
    pub static ref SENDER : Mutex<mpsc::UnboundedSender<ipc::Data>> = Mutex::new(check_connect_status(true));
}

#[inline]
#[tauri::command(async)]
pub fn recent_sessions_updated() -> bool {
    let mut childs = CHILDS.lock().unwrap();
    if childs.0 {
        childs.0 = false;
        true
    } else {
        false
    }
}

#[inline]
#[tauri::command(async)]
pub fn get_id() -> String {
    #[cfg(any(target_os = "android", target_os = "ios"))]
    return Config::get_id();
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    return ipc::get_id();
}

#[inline]
#[tauri::command(async)]
pub fn get_remote_id() -> String {
    LocalConfig::get_remote_id()
}

#[inline]
#[tauri::command(async)]
pub fn set_remote_id(id: String) {
    LocalConfig::set_remote_id(&id);
}

#[inline]
#[tauri::command(async)]
pub fn goto_install() {
    allow_err!(crate::run_me(vec!["--install"]));
}

#[inline]
#[tauri::command(async)]
pub fn install_me(_options: String, _path: String, _silent: bool, _debug: bool) {
    #[cfg(windows)]
    std::thread::spawn(move || {
        allow_err!(crate::platform::windows_lib::install_me(
            &_options, _path, _silent, _debug
        ));
        std::process::exit(0);
    });
}

#[inline]
#[tauri::command(async)]
pub fn update_me(_path: String) {
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("pkexec")
            .args(&["apt", "install", "-f", &_path])
            .spawn()
            .ok();
        std::fs::remove_file(&_path).ok();
        crate::run_me(Vec::<&str>::new()).ok();
    }
    #[cfg(windows)]
    {
        let mut path = _path;
        if path.is_empty() {
            if let Ok(tmp) = std::env::current_exe() {
                path = tmp.to_string_lossy().to_string();
            }
        }
        std::process::Command::new(path)
            .arg("--update")
            .spawn()
            .ok();
        std::process::exit(0);
    }
}

#[inline]
#[tauri::command(async)]
pub fn run_without_install() {
    crate::run_me(vec!["--noinstall"]).ok();
    std::process::exit(0);
}

#[inline]
#[tauri::command(async)]
pub fn show_run_without_install() -> bool {
    let mut it = std::env::args();
    if let Some(tmp) = it.next() {
        if crate::is_setup(&tmp) {
            return it.next() == None;
        }
    }
    false
}

#[inline]
#[tauri::command(async)]
pub fn has_rendezvous_service() -> bool {
    #[cfg(all(windows, feature = "hbbs"))]
    return crate::platform::is_win_server() && crate::platform::windows_lib::get_license().is_some();
    return false;
}

#[inline]
#[tauri::command(async)]
pub fn get_license() -> String {
    #[cfg(windows)]
    if let Some(lic) = crate::platform::windows_lib::get_license() {
        #[cfg(feature = "flutter")]
        {
            return format!("Key: {}\nHost: {}\nApi: {}", lic.key, lic.host, lic.api);
        }
        // default license format is html formed (sciter)
        return format!(
            "<br /> Key: {} <br /> Host: {} Api: {}",
            lic.key, lic.host, lic.api
        );
    }
    Default::default()
}

#[inline]
#[tauri::command(async)]
pub fn get_option(key: String) -> String {
    get_option_(&key)
}

#[inline]
#[tauri::command(async)]
fn get_option_(key: &str) -> String {
    let map = OPTIONS.lock().unwrap();
    if let Some(v) = map.get(key) {
        v.to_owned()
    } else {
        "".to_owned()
    }
}

#[inline]
#[tauri::command(async)]
pub fn get_local_option(key: String) -> String {
    LocalConfig::get_option(&key)
}

#[inline]
#[tauri::command(async)]
pub fn set_local_option(key: String, value: String) {
    LocalConfig::set_option(key, value);
}

#[inline]
#[tauri::command(async)]
pub fn peer_has_password(id: String) -> bool {
    !PeerConfig::load(&id).password.is_empty()
}

#[inline]
#[tauri::command(async)]
pub fn forget_password(id: String) {
    let mut c = PeerConfig::load(&id);
    c.password.clear();
    c.store(&id);
}

#[inline]
#[tauri::command(async)]
pub fn get_peer_option(id: String, name: String) -> String {
    let c = PeerConfig::load(&id);
    c.options.get(&name).unwrap_or(&"".to_owned()).to_owned()
}

#[inline]
#[tauri::command(async)]
pub fn set_peer_option(id: String, name: String, value: String) {
    let mut c = PeerConfig::load(&id);
    if value.is_empty() {
        c.options.remove(&name);
    } else {
        c.options.insert(name, value);
    }
    c.store(&id);
}

#[inline]
#[tauri::command(async)]
pub fn using_public_server() -> bool {
    crate::get_custom_rendezvous_server(get_option_("custom-rendezvous-server")).is_empty()
}

#[inline]
#[tauri::command(async)]
pub fn get_options() -> String {
    let options = OPTIONS.lock().unwrap();
    let mut m = serde_json::Map::new();
    for (k, v) in options.iter() {
        m.insert(k.into(), v.to_owned().into());
    }
    serde_json::to_string(&m).unwrap()
}

#[inline]
#[tauri::command(async)]
pub fn test_if_valid_server(host: String) -> String {
    hbb_common::socket_client::test_if_valid_server(&host)
}

#[inline]
#[tauri::command(async)]
#[cfg(not(any(target_os = "android", target_os = "ios")))]
pub fn get_sound_inputs() -> Vec<String> {
    let mut a = Vec::new();
    #[cfg(not(target_os = "linux"))]
    {
        fn get_sound_inputs_() -> Vec<String> {
            let mut out = Vec::new();
            use cpal::traits::{DeviceTrait, HostTrait};
            let host = cpal::default_host();
            if let Ok(devices) = host.devices() {
                for device in devices {
                    if device.default_input_config().is_err() {
                        continue;
                    }
                    if let Ok(name) = device.name() {
                        out.push(name);
                    }
                }
            }
            out
        }

        let inputs = Arc::new(Mutex::new(Vec::new()));
        let cloned = inputs.clone();
        // can not call below in UI thread, because conflict with sciter sound com initialization
        std::thread::spawn(move || *cloned.lock().unwrap() = get_sound_inputs_())
            .join()
            .ok();
        for name in inputs.lock().unwrap().drain(..) {
            a.push(name);
        }
    }
    #[cfg(target_os = "linux")]
    {
        let inputs: Vec<String> = crate::platform::linux::get_pa_sources()
            .drain(..)
            .map(|x| x.1)
            .collect();

        for name in inputs {
            a.push(name);
        }
    }
    a
}

#[inline]
#[tauri::command(async)]
pub fn set_options(m: HashMap<String, String>) {
    *OPTIONS.lock().unwrap() = m.clone();
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    ipc::set_options(m).ok();
    #[cfg(any(target_os = "android", target_os = "ios"))]
    Config::set_options(m);
}

#[inline]
#[tauri::command(async)]
pub fn set_option(key: String, value: String) {
    let mut options = OPTIONS.lock().unwrap();
    #[cfg(target_os = "macos")]
    if &key == "stop-service" {
        let is_stop = value == "Y";
        if is_stop && crate::platform::macos::uninstall() {
            return;
        }
    }
    if value.is_empty() {
        options.remove(&key);
    } else {
        options.insert(key.clone(), value.clone());
    }
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    ipc::set_options(options.clone()).ok();
    #[cfg(any(target_os = "android", target_os = "ios"))]
    Config::set_option(key, value);
}

#[inline]
#[tauri::command(async)]
pub fn install_path() -> String {
    #[cfg(windows)]
    return crate::platform::windows_lib::get_install_info().1;
    #[cfg(not(windows))]
    return "".to_owned();
}

#[inline]
#[tauri::command(async)]
pub fn get_socks() -> Vec<String> {
    #[cfg(any(target_os = "android", target_os = "ios"))]
    return Vec::new();
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        let s = ipc::get_socks();
        match s {
            None => Vec::new(),
            Some(s) => {
                let mut v = Vec::new();
                v.push(s.proxy);
                v.push(s.username);
                v.push(s.password);
                v
            }
        }
    }
}

#[inline]
#[tauri::command(async)]
pub fn set_socks(proxy: String, username: String, password: String) {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    ipc::set_socks(config::Socks5Server {
        proxy,
        username,
        password,
    })
    .ok();
}

#[inline]
#[tauri::command(async)]
pub fn is_installed() -> bool {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        return crate::platform::is_installed();
    }
    false
}

#[inline]
#[tauri::command(async)]
pub fn is_rdp_service_open() -> bool {
    #[cfg(windows)]
    return is_installed() && crate::platform::windows_lib::is_rdp_service_open();
    #[cfg(not(windows))]
    return false;
}

#[inline]
#[tauri::command(async)]
pub fn is_share_rdp() -> bool {
    #[cfg(windows)]
    return crate::platform::windows_lib::is_share_rdp();
    #[cfg(not(windows))]
    return false;
}

#[inline]
#[tauri::command(async)]
pub fn set_share_rdp(_enable: bool) {
    #[cfg(windows)]
    crate::platform::windows_lib::set_share_rdp(_enable);
}

#[inline]
#[tauri::command(async)]
pub fn is_installed_lower_version() -> bool {
    #[cfg(not(windows))]
    return false;
    #[cfg(windows)]
    {
        let installed_version = crate::platform::windows_lib::get_installed_version();
        let a = hbb_common::get_version_number(crate::VERSION);
        let b = hbb_common::get_version_number(&installed_version);
        return a > b;
    }
}

#[inline]
#[tauri::command(async)]
pub fn closing(x: i32, y: i32, w: i32, h: i32) {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    crate::server::input_service::fix_key_down_timeout_at_exit();
    LocalConfig::set_size(x, y, w, h);
}

#[inline]
#[tauri::command(async)]
pub fn get_size() -> Vec<i32> {
    let s = LocalConfig::get_size();
    let mut v = Vec::new();
    v.push(s.0);
    v.push(s.1);
    v.push(s.2);
    v.push(s.3);
    v
}

#[inline]
#[tauri::command(async)]
pub fn get_mouse_time() -> f64 {
    let ui_status = UI_STATUS.lock().unwrap();
    let res = ui_status.2 as f64;
    return res;
}

#[inline]
#[tauri::command(async)]
pub fn check_mouse_time() {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        let sender = SENDER.lock().unwrap();
        allow_err!(sender.send(ipc::Data::MouseMoveTime(0)));
    }
}

#[inline]
#[tauri::command(async)]
pub fn get_connect_status() -> Status {
    let ui_statue = UI_STATUS.lock().unwrap();
    let res = ui_statue.clone();
    res
}

#[inline]
#[tauri::command(async)]
pub fn temporary_password() -> String {
    #[cfg(any(target_os = "android", target_os = "ios"))]
    return password_security::temporary_password();
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    return TEMPORARY_PASSWD.lock().unwrap().clone();
}

#[inline]
#[tauri::command(async)]
pub fn update_temporary_password() {
    #[cfg(any(target_os = "android", target_os = "ios"))]
    password_security::update_temporary_password();
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    allow_err!(ipc::update_temporary_password());
}

#[inline]
#[tauri::command(async)]
pub fn permanent_password() -> String {
    #[cfg(any(target_os = "android", target_os = "ios"))]
    return Config::get_permanent_password();
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    return ipc::get_permanent_password();
}

#[inline]
#[tauri::command(async)]
pub fn set_permanent_password(password: String) {
    #[cfg(any(target_os = "android", target_os = "ios"))]
    Config::set_permanent_password(&password);
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    allow_err!(ipc::set_permanent_password(password));
}

#[inline]
#[tauri::command(async)]
pub fn get_peer(id: String) -> PeerConfig {
    PeerConfig::load(&id)
}

#[inline]
#[tauri::command(async)]
pub fn get_fav() -> Vec<String> {
    LocalConfig::get_fav()
}

#[inline]
#[tauri::command(async)]
pub fn store_fav(fav: Vec<String>) {
    LocalConfig::set_fav(fav);
}

#[inline]
#[tauri::command(async)]
pub fn get_recent_sessions() -> Vec<(String, SystemTime, PeerConfig)> {
    PeerConfig::peers()
}

#[inline]
#[tauri::command(async)]
#[cfg(not(any(target_os = "android", target_os = "ios", feature = "cli")))]
pub fn get_icon() -> String {
    crate::get_icon()
}

#[inline]
#[tauri::command(async)]
pub fn remove_peer(id: String) {
    PeerConfig::remove(&id);
}

#[inline]
#[tauri::command(async)]
pub fn new_remote(id: String, remote_type: String) {
    let mut lock = CHILDS.lock().unwrap();
    let args = vec![format!("--{}", remote_type), id.clone()];
    let key = (id.clone(), remote_type.clone());
    if let Some(c) = lock.1.get_mut(&key) {
        if let Ok(Some(_)) = c.try_wait() {
            lock.1.remove(&key);
        } else {
            if remote_type == "rdp" {
                allow_err!(c.kill());
                std::thread::sleep(std::time::Duration::from_millis(30));
                c.try_wait().ok();
                lock.1.remove(&key);
            } else {
                return;
            }
        }
    }
    match crate::run_me(args) {
        Ok(child) => {
            lock.1.insert(key, child);
        }
        Err(err) => {
            log::error!("Failed to spawn remote: {}", err);
        }
    }
}

#[inline]
#[tauri::command(async)]
pub fn is_process_trusted(_prompt: bool) -> bool {
    #[cfg(target_os = "macos")]
    return crate::platform::macos::is_process_trusted(_prompt);
    #[cfg(not(target_os = "macos"))]
    return true;
}

#[inline]
#[tauri::command(async)]
pub fn is_can_screen_recording(_prompt: bool) -> bool {
    #[cfg(target_os = "macos")]
    return crate::platform::macos::is_can_screen_recording(_prompt);
    #[cfg(not(target_os = "macos"))]
    return true;
}

#[inline]
#[tauri::command(async)]
pub fn is_installed_daemon(_prompt: bool) -> bool {
    #[cfg(target_os = "macos")]
    return crate::platform::macos::is_installed_daemon(_prompt);
    #[cfg(not(target_os = "macos"))]
    return true;
}

#[inline]
#[tauri::command(async)]
pub fn get_error() -> String {
    #[cfg(not(any(feature = "cli")))]
    #[cfg(target_os = "linux")]
    {
        let dtype = crate::platform::linux::get_display_server();
        if "wayland" == dtype {
            return crate::server::wayland::common_get_error();
        }
        if dtype != "x11" {
            return format!(
                "{} {}, {}",
                t("Unsupported display server ".to_owned()),
                dtype,
                t("x11 expected".to_owned()),
            );
        }
    }
    return "".to_owned();
}

#[inline]
#[tauri::command(async)]
pub fn is_login_wayland() -> bool {
    #[cfg(target_os = "linux")]
    return crate::platform::linux::is_login_wayland();
    #[cfg(not(target_os = "linux"))]
    return false;
}

#[inline]
#[tauri::command(async)]
pub fn fix_login_wayland() {
    #[cfg(target_os = "linux")]
    crate::platform::linux::fix_login_wayland();
}

#[inline]
#[tauri::command(async)]
pub fn current_is_wayland() -> bool {
    #[cfg(target_os = "linux")]
    return crate::platform::linux::current_is_wayland();
    #[cfg(not(target_os = "linux"))]
    return false;
}

#[inline]
#[tauri::command(async)]
pub fn modify_default_login() -> String {
    #[cfg(target_os = "linux")]
    return crate::platform::linux::modify_default_login();
    #[cfg(not(target_os = "linux"))]
    return "".to_owned();
}

#[inline]
#[tauri::command(async)]
pub fn get_software_update_url() -> String {
    SOFTWARE_UPDATE_URL.lock().unwrap().clone()
}

#[inline]
#[tauri::command(async)]
pub fn get_new_version() -> String {
    hbb_common::get_version_from_url(&*SOFTWARE_UPDATE_URL.lock().unwrap())
}

#[inline]
#[tauri::command(async)]
pub fn get_version() -> String {
    crate::VERSION.to_owned()
}

#[inline]
#[tauri::command(async)]
pub fn get_app_name() -> String {
    crate::get_app_name()
}

#[inline]
#[tauri::command(async)]
#[cfg(not(any(target_os = "android", target_os = "ios")))]
pub fn get_software_ext() -> String {
    #[cfg(windows)]
    let p = "exe";
    #[cfg(target_os = "macos")]
    let p = "dmg";
    #[cfg(target_os = "linux")]
    let p = "deb";
    p.to_owned()
}

#[inline]
#[tauri::command(async)]
#[cfg(not(any(target_os = "android", target_os = "ios")))]
pub fn get_software_store_path() -> String {
    let mut p = std::env::temp_dir();
    let name = SOFTWARE_UPDATE_URL
        .lock()
        .unwrap()
        .split("/")
        .last()
        .map(|x| x.to_owned())
        .unwrap_or(crate::get_app_name());
    p.push(name);
    format!("{}.{}", p.to_string_lossy(), get_software_ext())
}

#[inline]
#[tauri::command(async)]
pub fn create_shortcut(_id: String) {
    #[cfg(windows)]
    crate::platform::windows_lib::create_shortcut(&_id).ok();
}

#[inline]
#[tauri::command(async)]
pub fn discover() {
    std::thread::spawn(move || {
        allow_err!(crate::lan::discover());
    });
}

#[inline]
#[tauri::command(async)]
pub fn get_lan_peers() -> Vec<HashMap<&'static str, String>> {
    config::LanPeers::load()
        .peers
        .iter()
        .map(|peer| {
            HashMap::<&str, String>::from_iter([
                ("id", peer.id.clone()),
                ("username", peer.username.clone()),
                ("hostname", peer.hostname.clone()),
                ("platform", peer.platform.clone()),
            ])
        })
        .collect()
}

#[inline]
#[tauri::command(async)]
pub fn get_uuid() -> String {
    base64::encode(hbb_common::get_uuid())
}

#[inline]
#[tauri::command(async)]
#[cfg(not(any(target_os = "android", target_os = "ios", feature = "cli")))]
pub fn open_url(url: String) {
    #[cfg(windows)]
    let p = "explorer";
    #[cfg(target_os = "macos")]
    let p = "open";
    #[cfg(target_os = "linux")]
    let p = if std::path::Path::new("/usr/bin/firefox").exists() {
        "firefox"
    } else {
        "xdg-open"
    };
    allow_err!(std::process::Command::new(p).arg(url).spawn());
}

#[inline]
#[tauri::command(async)]
pub fn change_id(id: String) {
    *ASYNC_JOB_STATUS.lock().unwrap() = " ".to_owned();
    let old_id = get_id();
    std::thread::spawn(move || {
        *ASYNC_JOB_STATUS.lock().unwrap() = change_id_(id, old_id).to_owned();
    });
}

#[inline]
#[tauri::command(async)]
pub fn post_request(url: String, body: String, header: String) {
    *ASYNC_JOB_STATUS.lock().unwrap() = " ".to_owned();
    std::thread::spawn(move || {
        *ASYNC_JOB_STATUS.lock().unwrap() = match crate::post_request_sync(url, body, &header) {
            Err(err) => err.to_string(),
            Ok(text) => text,
        };
    });
}

#[inline]
#[tauri::command(async)]
#[cfg(not(any(target_os = "android", target_os = "ios")))]
pub fn is_ok_change_id() -> bool {
    machine_uid::get().is_ok()
}

#[inline]
#[tauri::command(async)]
pub fn get_async_job_status() -> String {
    ASYNC_JOB_STATUS.lock().unwrap().clone()
}

#[inline]
#[tauri::command(async)]
#[cfg(not(any(target_os = "android", target_os = "ios", feature = "cli")))]
pub fn t(name: String) -> String {
    crate::client::translate(name)
}

#[inline]
#[tauri::command(async)]
pub fn get_langs() -> String {
    crate::lang::LANGS.to_string()
}

#[inline]
#[tauri::command(async)]
pub fn default_video_save_directory() -> String {
    let appname = crate::get_app_name();

    #[cfg(any(target_os = "android", target_os = "ios"))]
    if let Ok(home) = config::APP_HOME_DIR.read() {
        let mut path = home.to_owned();
        path.push_str("/RustDesk/ScreenRecord");
        return path;
    }

    if let Some(user) = directories_next::UserDirs::new() {
        if let Some(video_dir) = user.video_dir() {
            return video_dir.join(appname).to_string_lossy().to_string();
        }
    }

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    if let Some(home) = platform::get_active_user_home() {
        let name = if cfg!(target_os = "macos") {
            "Movies"
        } else {
            "Videos"
        };
        return home.join(name).join(appname).to_string_lossy().to_string();
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            return dir.join("videos").to_string_lossy().to_string();
        }
    }
    "".to_owned()
}

#[inline]
#[tauri::command(async)]
pub fn is_xfce() -> bool {
    crate::platform::is_xfce()
}

#[inline]
#[tauri::command(async)]
pub fn get_api_server() -> String {
    crate::get_api_server(
        get_option_("api-server"),
        get_option_("custom-rendezvous-server"),
    )
}

#[inline]
#[tauri::command(async)]
pub fn has_hwcodec() -> bool {
    #[cfg(not(any(feature = "hwcodec", feature = "mediacodec")))]
    return false;
    #[cfg(any(feature = "hwcodec", feature = "mediacodec"))]
    return true;
}

#[inline]
#[tauri::command(async)]
pub fn is_release() -> bool {
    #[cfg(not(debug_assertions))]
    return true;
    #[cfg(debug_assertions)]
    return false;
}

#[inline]
#[tauri::command(async)]
pub fn is_root() -> bool {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    return crate::platform::is_root();
    false
}

#[inline]
#[tauri::command(async)]
pub fn check_super_user_permission() -> bool {
    #[cfg(any(windows, target_os = "linux"))]
    return crate::platform::check_super_user_permission().unwrap_or(false);
    #[cfg(not(any(windows, target_os = "linux")))]
    true
}

#[allow(dead_code)]
pub fn check_zombie(childs: Childs) {
    let mut deads = Vec::new();
    loop {
        let mut lock = childs.lock().unwrap();
        let mut n = 0;
        for (id, c) in lock.1.iter_mut() {
            if let Ok(Some(_)) = c.try_wait() {
                deads.push(id.clone());
                n += 1;
            }
        }
        for ref id in deads.drain(..) {
            lock.1.remove(id);
        }
        if n > 0 {
            lock.0 = true;
        }
        drop(lock);
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
}

pub(crate) fn check_connect_status(reconnect: bool) -> mpsc::UnboundedSender<ipc::Data> {
    let (tx, rx) = mpsc::unbounded_channel::<ipc::Data>();
    std::thread::spawn(move || check_connect_status_(reconnect, rx));
    tx
}

// notice: avoiding create ipc connecton repeatly,
// because windows named pipe has serious memory leak issue.
#[tokio::main(flavor = "current_thread")]
pub(crate) async fn check_connect_status_(reconnect: bool, rx: mpsc::UnboundedReceiver<ipc::Data>) {
    let mut key_confirmed = false;
    let mut rx = rx;
    let mut mouse_time = 0;
    let mut id = "".to_owned();
    loop {
        if let Ok(mut c) = ipc::connect(1000, "").await {
            let mut timer = time::interval(time::Duration::from_secs(1));
            loop {
                tokio::select! {
                    res = c.next() => {
                        match res {
                            Err(err) => {
                                log::error!("ipc connection closed: {}", err);
                                break;
                            }
                            Ok(Some(ipc::Data::MouseMoveTime(v))) => {
                                mouse_time = v;
                                UI_STATUS.lock().unwrap().2 = v;
                            }
                            Ok(Some(ipc::Data::Options(Some(v)))) => {
                                *OPTIONS.lock().unwrap() = v
                            }
                            Ok(Some(ipc::Data::Config((name, Some(value))))) => {
                                if name == "id" {
                                    id = value;
                                } else if name == "temporary-password" {
                                    *TEMPORARY_PASSWD.lock().unwrap() = value;
                                }
                            }
                            Ok(Some(ipc::Data::OnlineStatus(Some((mut x, c))))) => {
                                if x > 0 {
                                    x = 1
                                }
                                key_confirmed = c;
                                *UI_STATUS.lock().unwrap() = (x as _, key_confirmed, mouse_time, id.clone());
                            }
                            _ => {}
                        }
                    }
                    Some(data) = rx.recv() => {
                        allow_err!(c.send(&data).await);
                    }
                    _ = timer.tick() => {
                        c.send(&ipc::Data::OnlineStatus(None)).await.ok();
                        c.send(&ipc::Data::Options(None)).await.ok();
                        c.send(&ipc::Data::Config(("id".to_owned(), None))).await.ok();
                        c.send(&ipc::Data::Config(("temporary-password".to_owned(), None))).await.ok();
                    }
                }
            }
        }
        if !reconnect {
            OPTIONS
                .lock()
                .unwrap()
                .insert("ipc-closed".to_owned(), "Y".to_owned());
            break;
        }
        *UI_STATUS.lock().unwrap() = (-1, key_confirmed, mouse_time, id.clone());
        sleep(1.).await;
    }
}

#[tokio::main(flavor = "current_thread")]
pub(crate) async fn send_to_cm(data: &ipc::Data) {
    if let Ok(mut c) = ipc::connect(1000, "_cm").await {
        c.send(data).await.ok();
    }
}

const INVALID_FORMAT: &'static str = "Invalid format";
const UNKNOWN_ERROR: &'static str = "Unknown error";

#[tokio::main(flavor = "current_thread")]
async fn change_id_(id: String, old_id: String) -> &'static str {
    if !hbb_common::is_valid_custom_id(&id) {
        return INVALID_FORMAT;
    }

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let uuid = machine_uid::get().unwrap_or("".to_owned());
    #[cfg(any(target_os = "android", target_os = "ios"))]
    let uuid = base64::encode(hbb_common::get_uuid());

    if uuid.is_empty() {
        log::error!("Failed to change id, uuid is_empty");
        return UNKNOWN_ERROR;
    }

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let rendezvous_servers = crate::ipc::get_rendezvous_servers(1_000).await;
    #[cfg(any(target_os = "android", target_os = "ios"))]
    let rendezvous_servers = Config::get_rendezvous_servers();

    let mut futs = Vec::new();
    let err: Arc<Mutex<&str>> = Default::default();
    for rendezvous_server in rendezvous_servers {
        let err = err.clone();
        let id = id.to_owned();
        let uuid = uuid.clone();
        let old_id = old_id.clone();
        futs.push(tokio::spawn(async move {
            let tmp = check_id(rendezvous_server, old_id, id, uuid).await;
            if !tmp.is_empty() {
                *err.lock().unwrap() = tmp;
            }
        }));
    }
    join_all(futs).await;
    let err = *err.lock().unwrap();
    if err.is_empty() {
        #[cfg(not(any(target_os = "android", target_os = "ios")))]
        crate::ipc::set_config_async("id", id.to_owned()).await.ok();
        #[cfg(any(target_os = "android", target_os = "ios"))]
        {
            Config::set_key_confirmed(false);
            Config::set_id(&id);
        }
    }
    err
}

async fn check_id(
    rendezvous_server: String,
    old_id: String,
    id: String,
    uuid: String,
) -> &'static str {
    let any_addr = Config::get_any_listen_addr();
    if let Ok(mut socket) = FramedStream::new(
        crate::check_port(rendezvous_server, RENDEZVOUS_PORT),
        any_addr,
        RENDEZVOUS_TIMEOUT,
    )
    .await
    {
        let mut msg_out = Message::new();
        msg_out.set_register_pk(RegisterPk {
            old_id,
            id,
            uuid: uuid.into(),
            ..Default::default()
        });
        let mut ok = false;
        if socket.send(&msg_out).await.is_ok() {
            if let Some(Ok(bytes)) = socket.next_timeout(3_000).await {
                if let Ok(msg_in) = RendezvousMessage::parse_from_bytes(&bytes) {
                    match msg_in.union {
                        Some(rendezvous_message::Union::RegisterPkResponse(rpr)) => {
                            match rpr.result.enum_value_or_default() {
                                register_pk_response::Result::OK => {
                                    ok = true;
                                }
                                register_pk_response::Result::ID_EXISTS => {
                                    return "Not available";
                                }
                                register_pk_response::Result::TOO_FREQUENT => {
                                    return "Too frequent";
                                }
                                register_pk_response::Result::NOT_SUPPORT => {
                                    return "server_not_support";
                                }
                                register_pk_response::Result::SERVER_ERROR => {
                                    return "Server error";
                                }
                                register_pk_response::Result::INVALID_ID_FORMAT => {
                                    return INVALID_FORMAT;
                                }
                                _ => {}
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
        if !ok {
            return UNKNOWN_ERROR;
        }
    } else {
        return "Failed to connect to rendezvous server";
    }
    ""
}
