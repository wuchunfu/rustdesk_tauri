// TODO:
// view.windowFrame = is_osx ? #extended : #solid;

import { invoke } from "@tauri-apps/api";
import React from "react";

let body: any;
let connections: any = [];
let show_chat = false;

import { emit, listen } from '@tauri-apps/api/event'

// TODO: Test with tauri windows dev tools
const unlisten = await listen('addConnection', (event: any) => {
    console.log(event.payload);
    addConnection(event.payload.id, event.payload.is_file_transfer, event.payload.port_forward, event.payload.peer_id, event.payload.name, event.payload.authorized, event.payload.keyboard, event.payload.clipboard, event.payload.audio, event.payload.file, event.payload.restart, event.payload.recording);
    // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
    // event.payload is the payload object
})
// TODO: removeConnection
// TODO: new_message



class Body extends React.Component {
    cur(){
        return 0;
    }

    constructor(props: any) {
        super(props);
        body = this;
    }

    // TODO:
    // render() {
    //     if (connections.length == 0)
    //       return <div style="size:*; margin: * 0; text-align: center;">
    //             Waiting for new connection ...
    //             </div>;
    //     var c = connections[this.cur];
    //     this.connection = c;
    //     this.cid = c.id;
    //     var auth = c.authorized;
    //     var me = this;
    //     var callback = function(msg) {
    //         me.sendMsg(msg);
    //     };
    //     var right_style = show_chat ? "" : "display: none";
    //     var disconnected = c.disconnected;
    //    // below size:* is work around for Linux, it alreayd set in css, but not work, shit sciter
    //     return <div .content style="size:*">
    //         <div .left-panel>
    //             <div .icon-and-id>
    //                 <div .icon style={"background: " + string2RGB(c.name, 1)}>
    //                 {c.name[0].toUpperCase()}
    //                 </div>
    //                 <div>
    //                     <div .id style="font-weight: bold; font-size: 1.2em;">{c.name}</div>
    //                     <div .id>({c.peer_id})</div>
    //                     <div style="margin-top: 1.2em">{disconnected ? translate('Disconnected') : translate('Connected')} {" "} <span #time>{getElaspsed(c.time, c.now)}</span></div>
    //                 </div>
    //             </div>
    //             <div />
    //             {c.is_file_transfer || c.port_forward || disconnected ? "" : <div>{translate('Permissions')}</div>}
    //             {c.is_file_transfer || c.port_forward || disconnected ? "" : <div> <div .permissions>
    //                 <div class={!c.keyboard ? "disabled" : ""} title={translate('Allow using keyboard and mouse')}><icon .keyboard /></div>
    //                 <div class={!c.clipboard ? "disabled" : ""} title={translate('Allow using clipboard')}><icon .clipboard /></div>
    //                 <div class={!c.audio ? "disabled" : ""} title={translate('Allow hearing sound')}><icon .audio /></div>
    //                 <div class={!c.file ? "disabled" : ""} title={translate('Allow file copy and paste')}><icon .file /></div>
    //                 <div class={!c.restart ? "disabled" : ""} title={translate('Allow remote restart')}><icon .restart /></div>
    //             </div> <div .permissions style="margin-top:8px;" >
    //                 <div class={!c.recording ? "disabled" : ""} title={translate('Allow recording session')}><icon .recording /></div>
    //             </div></div>
    //             }
    //             {c.port_forward ? <div>Port Forwarding: {c.port_forward}</div> : ""}
    //             <div style="size:*"/>
    //             <div .buttons>
    //                  {auth ? "" : <button .button tabindex="-1" #accept>{translate('Accept')}</button>}
    //                  {auth ? "" : <button .button tabindex="-1" .outline #dismiss>{translate('Dismiss')}</button>}
    //                  {auth && !disconnected ? <button .button tabindex="-1" #disconnect>{translate('Disconnect')}</button> : ""}
    //                  {auth && disconnected ? <button .button tabindex="-1" #close>{translate('Close')}</button> : ""}
    //             </div>
    //             {c.is_file_transfer || c.port_forward ? "" : <div .chaticon>{svg_chat}</div>}
    //         </div>
    //         <div .right-panel style={right_style}>
    //             {c.is_file_transfer || c.port_forward ? "" : <ChatBox msgs={c.msgs} callback={callback} />}
    //         </div>
    //     </div>;
    // }

    // sendMsg(text: string) {
    //     if (!text) return;
    //     var { cid, connection } = this;
    //     checkClickTime(function() {
    //         connection.msgs.push({ name: "me", text: text, time: getNowStr()});
    //         handler.send_msg(cid, text);
    //         body.update();
    //     });
    // }

    // event click $(icon.keyboard) (e) {
    //     var { cid, connection } = this;
    //     checkClickTime(function() {
    //         connection.keyboard = !connection.keyboard;
    //         body.update();
    //         handler.switch_permission(cid, "keyboard", connection.keyboard);
    //     });
    // }

    // event click $(icon.clipboard) {
    //     var { cid, connection } = this;
    //     checkClickTime(function() {
    //         connection.clipboard = !connection.clipboard;
    //         body.update();
    //         handler.switch_permission(cid, "clipboard", connection.clipboard);
    //     });
    // }

    // event click $(icon.audio) {
    //     var { cid, connection } = this;
    //     checkClickTime(function() {
    //         connection.audio = !connection.audio;
    //         body.update();
    //         handler.switch_permission(cid, "audio", connection.audio);
    //     });
    // }

    // event click $(icon.file) {
    //     var { cid, connection } = this;
    //     checkClickTime(function() {
    //         connection.file = !connection.file;
    //         body.update();
    //         handler.switch_permission(cid, "file", connection.file);
    //     });
    // }

    // event click $(icon.restart) {
    //     var { cid, connection } = this;
    //     checkClickTime(function() {
    //         connection.restart = !connection.restart;
    //         body.update();
    //         handler.switch_permission(cid, "restart", connection.restart);
    //     });
    // }

    // event click $(icon.recording) {
    //     var { cid, connection } = this;
    //     checkClickTime(function() {
    //         connection.recording = !connection.recording;
    //         body.update();
    //         handler.switch_permission(cid, "recording", connection.recording);
    //     });
    // }

    // event click $(button#accept) {
    //     var { cid, connection } = this;
    //     checkClickTime(function() {
    //         connection.authorized = true;
    //         body.update();
    //         handler.authorize(cid);
    //         self.timer(30ms, function() {
    //             view.windowState = View.WINDOW_MINIMIZED;
    //         });
    //     });
    // }

    // event click $(button#dismiss) {
    //     var cid = this.cid;
    //     checkClickTime(function() {
    //         handler.close(cid);
    //     });
    // }

    // event click $(button#disconnect) {
    //     var cid = this.cid;
    //     checkClickTime(function() {
    //         handler.close(cid);
    //     });
    // }

    // event click $(button#close) {
    //     var cid = this.cid;
    //     if (this.cur >= 0 && this.cur < connections.length){
    //         handler.remove_disconnected_connection(cid);
    //         connections.splice(this.cur, 1);
    //         if (connections.length > 0) {
    //             if (this.cur > 0)
    //                 this.cur -= 1; 
    //             else
    //                 this.cur = connections.length - 1;
    //             header.update();
    //             body.update();
    //         } else {
    //             handler.quit();
    //         }
    //     }
        
    // }
}

// $(body).content(<Body />);

let header: any;

class Header extends React.Component {
    constructor(props: any) {
        super(props);
        header = this;
    }

    // render() {
    //     var me = this;
    //     var conn = connections[body.cur];
    //     if (conn && conn.unreaded > 0) {;
    //         var el = me.select("#unreaded" + conn.id);
    //         if (el) el.style.set {
    //             display: "inline-block",
    //         };
    //         self.timer(300ms, function() {
    //             conn.unreaded = 0;
    //             var el = me.select("#unreaded" + conn.id);
    //             if (el) el.style.set {
    //                 display: "none",
    //             };
    //         });
    //     }
    //     var tabs = connections.map(function(c, i) { return me.renderTab(c, i) });
    //     return <div .tabs-wrapper><div .tabs>
    //         {tabs}
    //         </div>
    //         <div .tab-arrows>
    //             <span #left-arrow>&lt;</span>
    //             <span #right-arrow>&gt;</span>
    //         </div>
    //     </div>;
    // }

    // renderTab(c: any, i: any) {
    //     var cur = body.cur;
    //     return <div class={i == cur ? "active-tab tab" : "tab"}>
    //         {c.name}
    //         {c.unreaded > 0 ? <span .unreaded id={"unreaded" + c.id}>{c.unreaded}</span> : ""}
    //     </div>;
    // }

    // update_cur(idx: any) {
    //     checkClickTime(function() {
    //         body.cur = idx;
    //         update();
    //         self.timer(1ms, adjustHeader);
    //     });
    // }

    // event click $(div.tab) (_, me) {
    //     var idx = me.index;
    //     if (idx == body.cur) return;
    //     this.update_cur(idx);
    // }

    // event click $(span#left-arrow) {
    //     var cur = body.cur;
    //     if (cur == 0) return;
    //     this.update_cur(cur - 1);
    // }

    // event click $(span#right-arrow) {
    //     var cur = body.cur;
    //     if (cur == connections.length - 1) return;
    //     this.update_cur(cur + 1);
    // }
}

// if (is_osx) {
//     $(header).content(<Header />);
//     $(header).attributes["role"] = "window-caption";
// } else {
//     $(div.window-toolbar).content(<Header />);
//     setWindowButontsAndIcon(true);
// }

// event click $(div.chaticon) {
//     checkClickTime(function() {
//         show_chat = !show_chat;
//         adaptSizeForChat();
//         if (show_chat) {
//             view.focus = $(.outline-focus);
//         }
//     });
// }

// const checkClickTime = (callback: any) => {
//     var click_callback_time = getTime();
//     await invoke("check_click_time", {body.cid});
//     self.timer(120ms, function() {
//         var d = click_callback_time - handler.get_click_time();
//         if (d > 120)
//             callback();
//     });
// }

// function adaptSizeForChat() {
//     $(div.right-panel).style.set {
//         display: show_chat ? "block" : "none",
//     };
//     var (x, y, w, h) = view.box(#rectw, #border, #screen);
//     if (show_chat && w < scaleIt(600)) {
//         view.move(x - (scaleIt(600) - w), y, scaleIt(600), h);
//     } else if (!show_chat && w > scaleIt(450)) {
//         view.move(x + (w - scaleIt(300)), y, scaleIt(300), h);
//     }
// }

// function update() {
//     header.update();
//     body.update();
// }

// function bring_to_top(idx=-1) {
//     if (view.windowState == View.WINDOW_HIDDEN || view.windowState == View.WINDOW_MINIMIZED) {
//         if (is_linux) {
//             view.focus = self;
//         } else {
//             view.windowState = View.WINDOW_SHOWN;
//         }
//         if (idx >= 0) body.cur = idx;
//     } else {
//         view.windowTopmost = true;
//         view.windowTopmost = false;
//     }
// }

const addConnection = (id: number, is_file_transfer: boolean, port_forward: string, peer_id: string, name: string, authorized: boolean, keyboard: boolean, clipboard: boolean, audio: boolean, file: boolean, restart: boolean, recording: boolean) => {
    console.log("new connection #" + id + ": " + peer_id);
    let conn: any;
    connections.map(function(c: any) {
        if (c.id == id) conn = c;
    });
    if (conn) {
        conn.authorized = authorized;
        // TODO:
        // update();
        return;
    }
    var idx = -1;
    connections.map(function(c: any, i: any) {
        if (c.disconnected && c.peer_id == peer_id) idx = i;
    });
    if (!name) name = "NA";
    conn = {
        id: id, is_file_transfer: is_file_transfer, peer_id: peer_id,
        port_forward: port_forward,
        name: name, authorized: authorized, time: new Date(), now: new Date(),
        keyboard: keyboard, clipboard: clipboard, msgs: [], unreaded: 0,
        audio: audio, file: file, restart: restart, recording: recording,
        disconnected: false
    };
    if (idx < 0) {
        connections.push(conn);
        body.cur = connections.length - 1;
    } else {
        connections[idx] = conn;
        body.cur = idx;
    }
    // TODO:
    // bring_to_top();
    // update();
    // self.timer(1ms, adjustHeader);
    // if (authorized) {
    //     self.timer(3s, function() {
    //         view.windowState = View.WINDOW_MINIMIZED;
    //     });
    // }
}

// handler.removeConnection = function(id, close) {
//     var i = -1;
//     connections.map(function(c, idx) {
//         if (c.id == id) i = idx;
//     });
//     if (i < 0) return;
//     if (close) {
//         connections.splice(i, 1);
//     } else {
//         var conn = connections[i];
//         conn.disconnected = true;
//     }
//     if (connections.length > 0) {
//         if (body.cur >= i && body.cur > 0 && close) body.cur -= 1;
//         update();
//     }
// }

// handler.newMessage = function(id, text) { 
//     var idx = -1;
//     connections.map(function(c, i) {
//         if (c.id == id) idx = i;
//     });
//     var conn = connections[idx];
//     if (!conn) return;
//     conn.msgs.push({name: conn.name, text: text, time: getNowStr()});
//     bring_to_top(idx);
//     if (idx == body.cur) {
//         var shouldAdapt = !show_chat;
//         show_chat = true;
//         if (shouldAdapt) adaptSizeForChat();
//     }
//     conn.unreaded += 1;
//     update();
// }

// view << event statechange {
//     adjustBorder();
// }

// function self.ready() {
//     adjustBorder();
//     var (sw, sh) = view.screenBox(#workarea, #dimension);
//     var w = scaleIt(300);
//     var h = scaleIt(400);
//     view.move(sw - w, 0, w, h);
// }

// function getElaspsed(time, now) {
//     var seconds = Date.diff(time, now, #seconds);
//     var hours = seconds / 3600;
//     var days = hours / 24;
//     hours = hours % 24;
//     var minutes = seconds % 3600 / 60;
//     seconds = seconds % 60;
//     var out = String.printf("%02d:%02d:%02d", hours, minutes, seconds);
//     if (days > 0) {
//         out = String.printf("%d day%s %s", days, days > 1 ? "s" : "", out);
//     }
//     return out;
// }

// function updateTime() {
//     self.timer(1s, function() {
//         var now = new Date();
//         connections.map(function(c) {
//             if (!c.disconnected) c.now = now;
//         });
//         var el = $(#time);
//         if (el) {
//             var c = connections[body.cur];
//             if (c && !c.disconnected) {
//                 el.text = getElaspsed(c.time, c.now);
//             }
//         }
//         updateTime();
//     });
// }

// updateTime();

// var tm0 = getTime();

// function self.closing() {
//     if (connections.length == 0 && getTime() - tm0 > 30000) return true;
//     view.windowState = View.WINDOW_HIDDEN;
//     return false;
// }


// function adjustHeader() {
//     var hw = $(header).box(#width) / scaleFactor;
//     var tabswrapper = $(div.tabs-wrapper);
//     var tabs = $(div.tabs);
//     var arrows = $(div.tab-arrows);
//     if (!arrows) return;
//     var n = connections.length;
//     var wtab = 80;
//     var max = hw - 98;
//     var need_width = n * wtab + scaleIt(2); // include border of active tab
//     if (need_width < max) {
//         arrows.style.set {
//             display: "none",
//         };
//         tabs.style.set {
//             width: need_width,
//             margin-left: 0,
//         };
//         tabswrapper.style.set {
//             width: need_width,
//         };
//     } else {
//         var margin = (body.cur + 1) * wtab - max + 30;
//         if (margin < 0) margin = 0;
//         arrows.style.set {
//             display: "block",
//         };
//         tabs.style.set {
//             width: (max - 20 + margin) + 'px',
//             margin-left: -margin + 'px'
//         };
//         tabswrapper.style.set {
//             width: (max + 10) + 'px',
//         };
//     }
// }

// view.on("size", adjustHeader);

// handler.addConnection(0, false, 0, "", "test1", true, false, false, true, true);
// handler.addConnection(1, false, 0, "", "test2--------", true, false, false, false, false);
// handler.addConnection(2, false, 0, "", "test3", true, false, false, false, false);
// handler.newMessage(0, 'h');
