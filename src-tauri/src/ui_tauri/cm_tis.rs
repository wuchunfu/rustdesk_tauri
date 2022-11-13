use hbb_common::log;
use serde::Serialize;
use crate::ui_cm_interface::Client;
use std::{
    collections::HashMap,
    iter::FromIterator,
    ops::{Deref, DerefMut},
    sync::{
        atomic::{AtomicI64, Ordering},
        RwLock,
    },
};

use std::time::{Duration, Instant};

lazy_static::lazy_static! {
    static ref Connections: RwLock<HashMap<i32, Connection>> = Default::default();
    static ref CLICK_TIME: AtomicI64 = AtomicI64::new(0);
}

#[derive(Serialize, Clone)]

pub struct Msg {
    pub id: i32,
    pub text: String,
    #[serde(skip)]
    pub time: Instant,
}


#[derive(Serialize, Clone)]
pub struct Connection {
    pub id: i32,
    pub authorized: bool,
    pub disconnected: bool,
    pub is_file_transfer: bool,
    pub port_forward: String,
    pub name: String,
    pub peer_id: String,
    #[serde(skip)]
    pub time: Instant,
    #[serde(skip)]
    pub now: Instant,
    pub keyboard: bool,
    pub clipboard: bool,
    pub msgs: Vec<Msg>, 
    pub unreaded: u32,
    pub audio: bool,
    pub file: bool,
    pub restart: bool,
    pub recording: bool,
}


fn bring_to_top(idx: i32) {
    // if (view.windowState == View.WINDOW_HIDDEN || view.windowState == View.WINDOW_MINIMIZED) {
    //     if (is_linux) {
    //         view.focus = self;
    //     } else {
    //         view.windowState = View.WINDOW_SHOWN;
    //     }
    //     if (idx >= 0) body.cur = idx;
    // } else {
    //     view.windowTopmost = true;
    //     view.windowTopmost = false;
    // }
}


fn adjustHeader() {
    // var hw = $(header).box(#width) / scaleFactor;
    // var tabswrapper = $(div.tabs-wrapper);
    // var tabs = $(div.tabs);
    // var arrows = $(div.tab-arrows);
    // if (!arrows) return;
    // var n = connections.length;
    // var wtab = 80;
    // var max = hw - 98;
    // var need_width = n * wtab + scaleIt(2); // include border of active tab
    // if (need_width < max) {
    //     arrows.style.set {
    //         display: "none",
    //     };
    //     tabs.style.set {
    //         width: need_width,
    //         margin-left: 0,
    //     };
    //     tabswrapper.style.set {
    //         width: need_width,
    //     };
    // } else {
    //     var margin = (body.cur + 1) * wtab - max + 30;
    //     if (margin < 0) margin = 0;
    //     arrows.style.set {
    //         display: "block",
    //     };
    //     tabs.style.set {
    //         width: (max - 20 + margin) + 'px',
    //         margin-left: -margin + 'px'
    //     };
    //     tabswrapper.style.set {
    //         width: (max + 10) + 'px',
    //     };
    // }
}

pub fn add_connection(client: &Client) {
    log::info!("new connection #{} : {}", client.id, client.peer_id);
    Connections.write().unwrap().get_mut(&client.id)
    .map(
        |client_conn| {
        client_conn.authorized = client.authorized;
        return ;
    });
    // if let Some(client_conn) = Connections.read().unwrap().get(&client.id) {
    //     client_conn.authorized = client.authorized;
    //     // TODO: Rerender frontend
    //     // update();
    //     return;
    // };

    Connections
        .write()
        .unwrap()
        .retain(|_, c| !(c.disconnected && c.peer_id == client.peer_id));

    let mut name = client.name.clone();
    if (name.is_empty()) {name = "NA".to_string()};
    let conn = Connection {
        name: name,
        time: Instant::now(), 
        now: Instant::now(),
        msgs: Vec::new(), 
        unreaded: 0,
        disconnected: false,
        id: client.id,
        is_file_transfer: client.is_file_transfer,
        port_forward: client.port_forward.clone(),
        peer_id: client.peer_id.clone(),
        authorized: client.authorized,
        keyboard: client.keyboard,
        clipboard: client.clipboard,
        audio: client.audio,
        file: client.file,
        restart: client.restart,
        recording: client.recording
    };
    Connections.write().unwrap().insert(conn.id, conn.clone());
    // body.cur = conn.id
    bring_to_top(-1);
    log::info!("start render");
    // TODO: Rerender frontend
    // update();

    // TODO: delayed launch
    // self.timer(1ms, adjustHeader);

    // TODO: delayed launch
    // if (client.authorized) {
    //     self.timer(3s, function() {
    //         view.windowState = View.WINDOW_MINIMIZED;
    //     });
    // }
}