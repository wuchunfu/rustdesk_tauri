use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
    sync::{Arc, Mutex},
};

use sciter::{
    dom::{
        event::{EventReason, BEHAVIOR_EVENTS, EVENT_GROUPS, PHASE_MASK},
        Element, HELEMENT,
    },
    make_args,
    video::{video_destination, AssetPtr, COLOR_SPACE},
    Value,
};

use hbb_common::{
    allow_err, fs::TransferJobMeta, log, message_proto::*, rendezvous_proto::ConnType,
};
use serde::{Serialize, Deserialize};

use crate::{
    client::*,
    ui_interface::has_hwcodec,
    ui_session_interface::{InvokeUiSession, Session},
};

type Video = AssetPtr<video_destination>;

lazy_static::lazy_static! {
    static ref VIDEO: Arc<Mutex<Option<Video>>> = Default::default();
}

/// SciterHandler
/// * element
/// * close_state  for file path when close
#[derive(Clone, Default)]
pub struct SciterHandler {
    element: Arc<Mutex<Option<Element>>>,
    close_state: HashMap<String, String>,
}

impl SciterHandler {
    #[inline]
    fn call(&self, func: &str, args: &[Value]) {
        if let Some(ref e) = self.element.lock().unwrap().as_ref() {
            allow_err!(e.call_method(func, args));
        }
    }

    // #[inline]
    // fn call2(&self, func: &str, args: &[Value]) {
    //     if let Some(ref e) = self.element.lock().unwrap().as_ref() {
    //         allow_err!(e.call_method(func, &super::value_crash_workaround(args)[..]));
    //     }
    // }
}

impl InvokeUiSession for SciterHandler {
    fn set_cursor_data(&self, cd: CursorData) {
        let mut colors = hbb_common::compress::decompress(&cd.colors);
        if colors.iter().filter(|x| **x != 0).next().is_none() {
            log::info!("Fix transparent");
            // somehow all 0 images shows black rect, here is a workaround
            colors[3] = 1;
        }
        let mut png = Vec::new();
        if let Ok(()) = repng::encode(&mut png, cd.width as _, cd.height as _, &colors) {
            self.call(
                "setCursorData",
                &make_args!(
                    cd.id.to_string(),
                    cd.hotx,
                    cd.hoty,
                    cd.width,
                    cd.height,
                    &png[..]
                ),
            );
        }
    }

    fn set_display(&self, x: i32, y: i32, w: i32, h: i32) {
        self.call("setDisplay", &make_args!(x, y, w, h));
        // https://sciter.com/forums/topic/color_spaceiyuv-crash
        // Nothing spectacular in decoder – done on CPU side.
        // So if you can do BGRA translation on your side – the better.
        // BGRA is used as internal image format so it will not require additional transformations.
        VIDEO.lock().unwrap().as_mut().map(|v| {
            v.stop_streaming().ok();
            let ok = v.start_streaming((w, h), COLOR_SPACE::Rgb32, None);
            log::info!("[video] reinitialized: {:?}", ok);
        });
    }

    fn update_privacy_mode(&self) {
        self.call("updatePrivacyMode", &[]);
    }

    fn set_permission(&self, name: &str, value: bool) {
        // TODO:
        // self.call2("setPermission", &make_args!(name, value));
    }

    fn close_success(&self) {
        // TODO:
        // self.call2("closeSuccess", &make_args!());
    }

    fn update_quality_status(&self, status: QualityStatus) {
        // TODO:
        // self.call2(
        //     "updateQualityStatus",
        //     &make_args!(
        //         status.speed.map_or(Value::null(), |it| it.into()),
        //         status.fps.map_or(Value::null(), |it| it.into()),
        //         status.delay.map_or(Value::null(), |it| it.into()),
        //         status.target_bitrate.map_or(Value::null(), |it| it.into()),
        //         status
        //             .codec_format
        //             .map_or(Value::null(), |it| it.to_string().into())
        //     ),
        // );
    }

    fn set_cursor_id(&self, id: String) {
        self.call("setCursorId", &make_args!(id));
    }

    fn set_cursor_position(&self, cp: CursorPosition) {
        self.call("setCursorPosition", &make_args!(cp.x, cp.y));
    }

    fn set_connection_type(&self, is_secured: bool, direct: bool) {
        self.call("setConnectionType", &make_args!(is_secured, direct));
    }

    fn job_error(&self, id: i32, err: String, file_num: i32) {
        self.call("jobError", &make_args!(id, err, file_num));
    }

    fn job_done(&self, id: i32, file_num: i32) {
        self.call("jobDone", &make_args!(id, file_num));
    }

    fn clear_all_jobs(&self) {
        self.call("clearAllJobs", &make_args!());
    }

    fn load_last_job(&self, cnt: i32, job_json: &str) {
        let job: Result<TransferJobMeta, serde_json::Error> = serde_json::from_str(job_json);
        if let Ok(job) = job {
            let path;
            let to;
            if job.is_remote {
                path = job.remote.clone();
                to = job.to.clone();
            } else {
                path = job.to.clone();
                to = job.remote.clone();
            }
            self.call(
                "addJob",
                &make_args!(cnt, path, to, job.file_num, job.show_hidden, job.is_remote),
            );
        }
    }

    fn update_folder_files(
        &self,
        id: i32,
        entries: &Vec<FileEntry>,
        path: String,
        _is_local: bool,
        only_count: bool,
    ) {
        let mut m = make_fd(id, entries, only_count);
        m.set_item("path", path);
        self.call("updateFolderFiles", &make_args!(m));
    }

    fn update_transfer_list(&self) {
        self.call("updateTransferList", &make_args!());
    }

    fn confirm_delete_files(&self, id: i32, i: i32, name: String) {
        self.call("confirmDeleteFiles", &make_args!(id, i, name));
    }

    fn override_file_confirm(&self, id: i32, file_num: i32, to: String, is_upload: bool) {
        self.call(
            "overrideFileConfirm",
            &make_args!(id, file_num, to, is_upload),
        );
    }

    fn job_progress(&self, id: i32, file_num: i32, speed: f64, finished_size: f64) {
        self.call(
            "jobProgress",
            &make_args!(id, file_num, speed, finished_size),
        );
    }

    fn adapt_size(&self) {
        self.call("adaptSize", &make_args!());
    }

    fn on_rgba(&self, data: &[u8]) {
        VIDEO
            .lock()
            .unwrap()
            .as_mut()
            .map(|v| v.render_frame(data).ok());
    }

    fn set_peer_info(&self, pi: &PeerInfo) {
        let mut pi_sciter = Value::map();
        pi_sciter.set_item("username", pi.username.clone());
        pi_sciter.set_item("hostname", pi.hostname.clone());
        pi_sciter.set_item("platform", pi.platform.clone());
        pi_sciter.set_item("sas_enabled", pi.sas_enabled);

        let mut displays = Value::array(0);
        for ref d in pi.displays.iter() {
            let mut display = Value::map();
            display.set_item("x", d.x);
            display.set_item("y", d.y);
            display.set_item("width", d.width);
            display.set_item("height", d.height);
            displays.push(display);
        }
        pi_sciter.set_item("displays", displays);
        pi_sciter.set_item("current_display", pi.current_display);
        self.call("updatePi", &make_args!(pi_sciter));
    }

    fn msgbox(&self, msgtype: &str, title: &str, text: &str, link: &str, retry: bool) {
        // TODO:
        // self.call2("msgbox_retry", &make_args!(msgtype, title, text, link, retry));
    }

    fn new_message(&self, msg: String) {
        self.call("newMessage", &make_args!(msg));
    }

    fn switch_display(&self, display: &SwitchDisplay) {
        self.call("switchDisplay", &make_args!(display.display));
    }

    fn update_block_input_state(&self, on: bool) {
        self.call("updateBlockInputState", &make_args!(on));
    }
}

pub struct TauriSession(Session<SciterHandler>);


// use std::{
//     sync::{Arc, Mutex, RwLock, Weak},
// };

// pub struct DbTauriSession(Mutex<Option<TauriSession>>);
// #[derive(Default)]
// pub struct DbTauriSession(Arc<RwLock<TauriSession>>);


// impl DbTauriSession {
//     pub fn new(cmd: String, id: String, password: String, args: Vec<String>) -> Self {
//         let tauri_session = Mutex::new(Some(TauriSession::new(cmd, id, password, args)));
    
//         Self(tauri_session)
//     }
    
// }

// pub struct DbTauriSession {
//     pub db: Mutex<TauriSession>,
// }
// impl DbTauriSession {
//     pub fn new(cmd: String, id: String, password: String, args: Vec<String>) -> Self{
//         let mut session = TauriSession::new(cmd, id, password, args);
//         Self { db: (Mutex::new(session)) }

//     }
// }

impl Deref for TauriSession {
    type Target = Session<SciterHandler>;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for TauriSession {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl sciter::EventHandler for  TauriSession {
    fn get_subscription(&mut self) -> Option<EVENT_GROUPS> {
        Some(EVENT_GROUPS::HANDLE_BEHAVIOR_EVENT)
    }

    fn attached(&mut self, root: HELEMENT) {
        *self.element.lock().unwrap() = Some(Element::from(root));
    }

    fn detached(&mut self, _root: HELEMENT) {
        *self.element.lock().unwrap() = None;
        self.sender.write().unwrap().take().map(|sender| {
            sender.send(Data::Close).ok();
        });
    }

    // https://github.com/sciter-sdk/rust-sciter/blob/master/examples/video.rs
    fn on_event(
        &mut self,
        _root: HELEMENT,
        source: HELEMENT,
        _target: HELEMENT,
        code: BEHAVIOR_EVENTS,
        phase: PHASE_MASK,
        reason: EventReason,
    ) -> bool {
        if phase != PHASE_MASK::BUBBLING {
            return false;
        }
        match code {
            BEHAVIOR_EVENTS::VIDEO_BIND_RQ => {
                let source = Element::from(source);
                log::debug!("[video] {:?} {} ({:?})", code, source, reason);
                if let EventReason::VideoBind(ptr) = reason {
                    if ptr.is_null() {
                        return true;
                    }
                    let site = AssetPtr::adopt(ptr as *mut video_destination);
                    log::debug!("[video] start video");
                    *VIDEO.lock().unwrap() = Some(site);
                    self.reconnect();
                }
            }
            BEHAVIOR_EVENTS::VIDEO_INITIALIZED => {
                log::debug!("[video] {:?}", code);
            }
            BEHAVIOR_EVENTS::VIDEO_STARTED => {
                log::debug!("[video] {:?}", code);
                let source = Element::from(source);
                use sciter::dom::ELEMENT_AREAS;
                let flags = ELEMENT_AREAS::CONTENT_BOX as u32 | ELEMENT_AREAS::SELF_RELATIVE as u32;
                let rc = source.get_location(flags).unwrap();
                log::debug!(
                    "[video] start video thread on <{}> which is about {:?} pixels",
                    source,
                    rc.size()
                );
            }
            BEHAVIOR_EVENTS::VIDEO_STOPPED => {
                log::debug!("[video] {:?}", code);
            }
            _ => return false,
        };
        return true;
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub enum PortForwards {
    String(String),
    Number(i32),
}

impl TauriSession {
    pub fn new(cmd: String, id: String, password: String, args: Vec<String>) -> Self {
        let session: Session<SciterHandler> = Session {
            id: id.clone(),
            password: password.clone(),
            args,
            ..Default::default()
        };

        let conn_type = if cmd.eq("--file-transfer") {
            ConnType::FILE_TRANSFER
        } else if cmd.eq("--port-forward") {
            ConnType::PORT_FORWARD
        } else if cmd.eq("--rdp") {
            ConnType::RDP
        } else {
            ConnType::DEFAULT_CONN
        };

        session.lc.write().unwrap().initialize(id, conn_type);

        Self(session)
    }

    fn get_custom_image_quality(&mut self) -> Value {
        let mut v = Value::array(0);
        for x in self.lc.read().unwrap().custom_image_quality.iter() {
            v.push(x);
        }
        v
    }

    pub fn has_hwcodec(&self) -> bool {
        has_hwcodec()
    }

    pub fn t(&self, name: String) -> String {
        crate::client::translate(name)
    }

    pub fn get_icon(&self) -> String {
        crate::get_icon()
    }

    fn supported_hwcodec(&self) -> Value {
        let (h264, h265) = self.0.supported_hwcodec();
        let mut v = Value::array(0);
        v.push(h264);
        v.push(h265);
        v
    }

    pub fn save_size(&mut self, x: i32, y: i32, w: i32, h: i32) {
        let size = (x, y, w, h);
        let mut config = self.load_config();
        if self.is_file_transfer() {
            let close_state = self.close_state.clone();
            let mut has_change = false;
            for (k, mut v) in close_state {
                if k == "remote_dir" {
                    v = self.lc.read().unwrap().get_all_remote_dir(v);
                }
                let v2 = if v.is_empty() { None } else { Some(&v) };
                if v2 != config.options.get(&k) {
                    has_change = true;
                    if v2.is_none() {
                        config.options.remove(&k);
                    } else {
                        config.options.insert(k, v);
                    }
                }
            }
            if size == config.size_ft && !has_change {
                return;
            }
            config.size_ft = size;
        } else if self.is_port_forward() {
            if size == config.size_pf {
                return;
            }
            config.size_pf = size;
        } else {
            if size == config.size {
                return;
            }
            config.size = size;
        }
        self.save_config(config);
        log::info!("size saved");
    }

    pub fn get_port_forwards(&mut self) -> Vec<Vec<PortForwards>> {
        let port_forwards = self.lc.read().unwrap().port_forwards.clone();
        let mut v = Vec::new();
        for (port, remote_host, remote_port) in port_forwards {
            let mut v2: Vec<PortForwards> = Vec::new();
            v2.push(PortForwards::Number(port));
            v2.push(PortForwards::String(remote_host));
            v2.push(PortForwards::Number(remote_port));
            v.push(v2);
        }
        v
    }

    pub fn get_args(&mut self) -> Vec<String> {
        self.args.clone()
    }

    pub fn get_size(&mut self) -> Vec<i32> {
        let s = if self.is_file_transfer() {
            self.lc.read().unwrap().size_ft
        } else if self.is_port_forward() {
            self.lc.read().unwrap().size_pf
        } else {
            self.lc.read().unwrap().size
        };
        let mut v = Vec::new();
        v.push(s.0);
        v.push(s.1);
        v.push(s.2);
        v.push(s.3);
        v
    }

    pub fn get_default_pi(&mut self) -> hbb_common::config::PeerInfoSerde {
        self.lc.read().unwrap().info.clone()
    }

    pub fn save_close_state(&mut self, k: String, v: String) {
        self.close_state.insert(k, v);
    }

    fn get_key_event(&self, down_or_up: i32, name: &str, code: i32) -> Option<KeyEvent> {
        let mut key_event = KeyEvent::new();
        if down_or_up == 2 {
            /* windows send both keyup/keydown and keychar, so here we avoid keychar
               for <= 0xFF, best practice should only avoid those not on keyboard, but
               for now, we have no way to test, so avoid <= 0xFF totally
            */
            if code <= 0xFF {
                return None;
            }
            key_event.set_unicode(code.clone() as _);
        } else if let Some(key) = KEY_MAP.get(name) {
            match key {
                Key::Chr(chr) => {
                    key_event.set_chr(chr.clone());
                }
                Key::ControlKey(key) => {
                    key_event.set_control_key(key.clone());
                }
                _ => {}
            }
        } else {
            if cfg!(target_os = "macos") {
                match code {
                    0x4C => key_event.set_control_key(ControlKey::NumpadEnter), // numpad enter
                    0x69 => key_event.set_control_key(ControlKey::Snapshot),
                    0x72 => key_event.set_control_key(ControlKey::Help),
                    0x6E => key_event.set_control_key(ControlKey::Apps),
                    0x47 => {
                        key_event.set_control_key(if self.peer_platform() == "Mac OS" {
                            ControlKey::Clear
                        } else {
                            ControlKey::NumLock
                        });
                    }
                    0x51 => key_event.set_control_key(ControlKey::Equals),
                    0x2F => key_event.set_chr('.' as _),
                    0x32 => key_event.set_chr('`' as _),
                    _ => {
                        log::error!("Unknown key code {}", code);
                        return None;
                    }
                }
            } else if cfg!(windows) {
                match code {
                    0x2C => key_event.set_control_key(ControlKey::Snapshot),
                    0x91 => key_event.set_control_key(ControlKey::Scroll),
                    0x90 => key_event.set_control_key(ControlKey::NumLock),
                    0x5C => key_event.set_control_key(ControlKey::RWin),
                    0x5B => key_event.set_control_key(ControlKey::Meta),
                    0x5D => key_event.set_control_key(ControlKey::Apps),
                    0xBE => key_event.set_chr('.' as _),
                    0xC0 => key_event.set_chr('`' as _),
                    _ => {
                        log::error!("Unknown key code {}", code);
                        return None;
                    }
                }
            } else if cfg!(target_os = "linux") {
                match code {
                    65300 => key_event.set_control_key(ControlKey::Scroll),
                    65421 => key_event.set_control_key(ControlKey::NumpadEnter), // numpad enter
                    65407 => key_event.set_control_key(ControlKey::NumLock),
                    65515 => key_event.set_control_key(ControlKey::Meta),
                    65516 => key_event.set_control_key(ControlKey::RWin),
                    65513 => key_event.set_control_key(ControlKey::Alt),
                    65514 => key_event.set_control_key(ControlKey::RAlt),
                    65508 => key_event.set_control_key(ControlKey::RControl),
                    65506 => key_event.set_control_key(ControlKey::RShift),
                    96 => key_event.set_chr('`' as _),
                    46 => key_event.set_chr('.' as _),
                    126 => key_event.set_chr('`' as _),
                    33 => key_event.set_chr('1' as _),
                    64 => key_event.set_chr('2' as _),
                    35 => key_event.set_chr('3' as _),
                    36 => key_event.set_chr('4' as _),
                    37 => key_event.set_chr('5' as _),
                    94 => key_event.set_chr('6' as _),
                    38 => key_event.set_chr('7' as _),
                    42 => key_event.set_chr('8' as _),
                    40 => key_event.set_chr('9' as _),
                    41 => key_event.set_chr('0' as _),
                    95 => key_event.set_chr('-' as _),
                    43 => key_event.set_chr('=' as _),
                    123 => key_event.set_chr('[' as _),
                    125 => key_event.set_chr(']' as _),
                    124 => key_event.set_chr('\\' as _),
                    58 => key_event.set_chr(';' as _),
                    34 => key_event.set_chr('\'' as _),
                    60 => key_event.set_chr(',' as _),
                    62 => key_event.set_chr('.' as _),
                    63 => key_event.set_chr('/' as _),
                    _ => {
                        log::error!("Unknown key code {}", code);
                        return None;
                    }
                }
            } else {
                log::error!("Unknown key code {}", code);
                return None;
            }
        }
        Some(key_event)
    }

    pub fn get_char(&mut self, name: String, code: i32) -> String {
        if let Some(key_event) = self.get_key_event(1, &name, code) {
            match key_event.union {
                Some(key_event::Union::Chr(chr)) => {
                    if let Some(chr) = std::char::from_u32(chr as _) {
                        return chr.to_string();
                    }
                }
                _ => {}
            }
        }
        "".to_owned()
    }

    pub fn transfer_file(&mut self) {
        let id = self.get_id();
        let args = vec!["--file-transfer", &id, &self.password];
        if let Err(err) = crate::run_me(args) {
            log::error!("Failed to spawn file transfer: {}", err);
        }
    }

    pub fn tunnel(&mut self) {
        let id = self.get_id();
        let args = vec!["--port-forward", &id, &self.password];
        if let Err(err) = crate::run_me(args) {
            log::error!("Failed to spawn IP tunneling: {}", err);
        }
    }

}

pub fn make_fd(id: i32, entries: &Vec<FileEntry>, only_count: bool) -> Value {
    let mut m = Value::map();
    m.set_item("id", id);
    let mut a = Value::array(0);
    let mut n: u64 = 0;
    for entry in entries {
        n += entry.size;
        if only_count {
            continue;
        }
        let mut e = Value::map();
        e.set_item("name", entry.name.to_owned());
        let tmp = entry.entry_type.value();
        e.set_item("type", if tmp == 0 { 1 } else { tmp });
        e.set_item("time", entry.modified_time as f64);
        e.set_item("size", entry.size as f64);
        a.push(e);
    }
    if !only_count {
        m.set_item("entries", a);
    }
    m.set_item("num_entries", entries.len() as i32);
    m.set_item("total_size", n as f64);
    m
}
