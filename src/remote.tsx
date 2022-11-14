import { invoke } from "@tauri-apps/api"
// var cursor_img = $(img#cursor);
const is_file_transfer = await invoke<boolean>("is_file_transfer");
const is_port_forward = await invoke<boolean>("is_port_forward");
var input_blocked = false;
var display_width = 0;
var display_height = 0;
var display_origin_x = 0;
var display_origin_y = 0;
var display_scale = 1;
var keyboard_enabled = true; // server side
var clipboard_enabled = true; // server side
var audio_enabled = true; // server side
var file_enabled = true; // server side
var restart_enabled = true; // server side
var recording_enabled = true; // server side
// var scroll_body = $(body);

// handler.setDisplay = function(x, y, w, h) {
//     display_width = w;
//     display_height = h;
//     display_origin_x = x;
//     display_origin_y = y;
//     adaptDisplay();
//     if (recording) handler.record_screen(true, w, h);
// }

// // in case toolbar not shown correclty
// view.windowMinSize = (scaleIt(500), scaleIt(300));

// function adaptDisplay() {
//     var w = display_width;
//     var h = display_height;
//     if (!w || !h) return;
//     var style = handler.get_view_style();
//     display_scale = 1.;
//     var (sx, sy, sw, sh) = view.screenBox(view.windowState == View.WINDOW_FULL_SCREEN ? #frame : #workarea, #rectw);
//     if (sw >= w && sh > h) {
//         var hh = $(header).box(#height, #border);
//         var el = $(div#adjust-window);
//         if (sh > h + hh && el) {
//             el.style.set{ display: "block" };
//             el = $(li#adjust-window);
//             el.style.set{ display: "block" };
//             el.onClick = function() {
//                 view.windowState == View.WINDOW_SHOWN;
//                 var (x, y) = view.box(#position, #border, #screen);
//                 // extra for border
//                 var extra = is_win ? 4 : 2;
//                 view.move(x, y, (w + extra).toInteger(), (h + hh + extra).toInteger());
//             }
//         }
//     }
//     if (style != "original") {
//         var bw = $(body).box(#width, #border);
//         var bh = $(body).box(#height, #border);
//         if (view.windowState == View.WINDOW_FULL_SCREEN) {
//             bw = sw;
//             bh = sh;
//         }
//         if (bw > 0 && bh > 0) {
//             var scale_x = bw.toFloat() / w;
//             var scale_y = bh.toFloat() / h;
//             var scale = scale_x < scale_y ? scale_x : scale_y;
//             if ((scale > 1 && style == "stretch") ||
//                 (scale < 1 && style == "shrink")) {
//                 display_scale = scale;
//                 w = w * scale;
//                 h = h * scale;
//             }
//         }
//     }
//     refreshCursor();
//     handler.style.set {
//         width: w / scaleFactor + "px",
//         height: h / scaleFactor + "px",
//     };
// }

// // https://sciter.com/event-handling/
// // https://sciter.com/docs/content/sciter/Event.htm

// var entered = false;
// if (!is_file_transfer && !is_port_forward) {
//     self.onKey = function(evt) {
//         if (!entered) return false;
//         // so that arrow key not move scrollbar
//         return true; 
//     }
// }

// var wait_window_toolbar = false;
// var last_mouse_mask;
// var is_left_down = false;
// var acc_wheel_delta_x = 0;
// var acc_wheel_delta_y = 0;
// var last_wheel_time = 0;
// var inertia_velocity_x = 0;
// var inertia_velocity_y = 0;
// var acc_wheel_delta_x0 = 0;
// var acc_wheel_delta_y0 = 0;
// var total_wheel_time = 0;
// var wheeling = false;
// var dragging = false;
// var is_mouse_event_triggered = false;

// // https://stackoverflow.com/questions/5833399/calculating-scroll-inertia-momentum
// function resetWheel() {
//     acc_wheel_delta_x = 0;
//     acc_wheel_delta_y = 0;
//     last_wheel_time = 0;
//     inertia_velocity_x = 0;
//     inertia_velocity_y = 0;
//     acc_wheel_delta_x0 = 0;
//     acc_wheel_delta_y0 = 0;
//     total_wheel_time = 0;
//     wheeling = false;
// }

// var INERTIA_ACCELERATION = 30;

// // not good, precision not enough to simulate accelation effect,
// // seems have to use pixel based rather line based delta
// function accWheel(v, is_x) {
//     if (wheeling) return;
//     var abs_v = Math.abs(v);
//     var max_t = abs_v / INERTIA_ACCELERATION;
//     for (var t = 0.1; t < max_t; t += 0.1) {
//         var d = Math.round((abs_v - t * INERTIA_ACCELERATION / 2) * t).toInteger();
//         if (d >= 1) {
//             abs_v -= t * INERTIA_ACCELERATION;
//             if (v < 0) {
//                 d = -d;
//                 v = -abs_v;
//             } else {
//                 v = abs_v;
//             }
//             handler.send_mouse(3, is_x ? d : 0, !is_x ? d : 0, false, false, false, false);
//             accWheel(v, is_x);
//             break;
//         }
//     }
// }

// function handler.onMouse(evt)
// {
//     is_mouse_event_triggered = true;
//     if (is_file_transfer || is_port_forward) return false;
//     if (view.windowState == View.WINDOW_FULL_SCREEN && !dragging) {
//         var dy = evt.y - scroll_body.scroll(#top);
//         if (dy <= 1) {
//             if (!wait_window_toolbar) {
//                 wait_window_toolbar = true;
//                 self.timer(300ms, function() {
//                     if (!wait_window_toolbar) return;
//                     var extra = 0;
//                     // workaround for stupid Sciter, without this, click
//                     // event not triggered on top part of buttons on toolbar
//                     if (is_osx) extra = 10; 
//                     if (view.windowState == View.WINDOW_FULL_SCREEN) {
//                         $(header).style.set {
//                           display: "block",
//                           padding: (2 * workarea_offset + extra) + "px 0 0 0",
//                         };
//                     }
//                     wait_window_toolbar = false;
//                 });
//             }
//         } else {
//             wait_window_toolbar = false;
//             var h = $(header).style;
//             if (dy > 20 && h#display != "none") {
//               h.set {
//                   display: "none",
//               };
//             }
//         } 
//     }
//     if (!got_mouse_control) {
//         if (Math.abs(evt.x - cur_local_x) > 12 || Math.abs(evt.y - cur_local_y) > 12) {
//             got_mouse_control = true;
//         } else {
//             return;
//         }
//     }
//     var mask = 0;
//     var wheel_delta_x;
//     var wheel_delta_y;
//     switch(evt.type) {
//       case Event.MOUSE_DOWN:
//         mask = 1;
//         dragging = true;
//         break; 
//       case Event.MOUSE_UP:
//         mask = 2;
//         dragging = false;
//         break;
//       case Event.MOUSE_MOVE:
//         if (cursor_img.style#display != "none" && keyboard_enabled) {
//             cursor_img.style#display = "none";
//         }
//         if (!keyboard_enabled && !useSystemCursor) {
//             updateCursor(true);
//         }
//         if (keyboard_enabled && useSystemCursor) {
//             updateCursor();
//         }
//         break;
//       case Event.MOUSE_WHEEL:
//         // mouseWheelDistance = 8 * [currentUserDefs floatForKey:@"com.apple.scrollwheel.scaling"];
//         mask = 3; 
//         {
//             var (dx, dy) = evt.wheelDeltas;
//             if (dx > 0) dx = 1;
//             else if (dx < 0) dx = -1;
//             if (dy > 0) dy = 1;
//             else if (dy < 0) dy = -1;
//             if (Math.abs(dx) > Math.abs(dy)) {
//                 dy = 0;
//             } else {
//                 dx = 0;
//             }
//             acc_wheel_delta_x += dx;
//             acc_wheel_delta_y += dy;
//             wheel_delta_x = acc_wheel_delta_x.toInteger();
//             wheel_delta_y = acc_wheel_delta_y.toInteger();
//             acc_wheel_delta_x -= wheel_delta_x;
//             acc_wheel_delta_y -= wheel_delta_y;
//             var now = getTime();
//             var dt = last_wheel_time > 0 ? (now - last_wheel_time) / 1000 : 0;
//             if (dt > 0) {
//                 var vx = dx / dt;
//                 var vy = dy / dt;
//                 if (vx != 0 || vy != 0) {
//                     inertia_velocity_x = vx;
//                     inertia_velocity_y = vy;
//                 }
//             }
//             acc_wheel_delta_x0 += dx;
//             acc_wheel_delta_y0 += dy;
//             total_wheel_time += dt;
//             if (dx == 0 && dy == 0) {
//                 wheeling = false;
//                 if (dt < 0.1 && total_wheel_time > 0) {
//                     var v2 = (acc_wheel_delta_y0 / total_wheel_time) * inertia_velocity_y;
//                     if (v2 > 0) {
//                         v2 = Math.sqrt(v2);
//                         inertia_velocity_y = inertia_velocity_y < 0 ? -v2  : v2;
//                         accWheel(inertia_velocity_y, false);
//                     }
//                     v2 = (acc_wheel_delta_x0 / total_wheel_time) * inertia_velocity_x;
//                     if (v2 > 0) {
//                         v2 = Math.sqrt(v2);
//                         inertia_velocity_x = inertia_velocity_x < 0 ? -v2  : v2;
//                         accWheel(inertia_velocity_x, true);
//                     }
//                 }
//                 resetWheel();
//             } else {
//                 wheeling = true;
//             }
//             last_wheel_time = now;
//             if (wheel_delta_x == 0 && wheel_delta_y == 0) return keyboard_enabled;
//         }
//         break;
//       case Event.MOUSE_DCLICK: // seq: down, up, dclick, up
//         mask = 1;
//         break;
//       case Event.MOUSE_ENTER:
//         entered = true;
//         stdout.println("enter");
//         handler.enter();
//         return keyboard_enabled;
//       case Event.MOUSE_LEAVE:
//         entered = false;
//         stdout.println("leave");
//         handler.leave();
//         if (is_left_down && handler.peer_platform() == "Android") {
//             is_left_down = false;
//             handler.send_mouse((1 << 3) | 2, 0, 0, evt.altKey,
//                 evt.ctrlKey, evt.shiftKey, evt.commandKey);
//         }
//         return keyboard_enabled;
//       default:
//         return false;
//     }
//     var x = evt.x;
//     var y = evt.y;
//     if (mask != 0) {
//         // to gain control of the mouse, user must move mouse
//         if (cur_x != x || cur_y != y) {
//             return keyboard_enabled;
//         }
//     } else {
//         cur_local_x = cur_x = x;
//         cur_local_y = cur_y = y;
//     }
//     if (mask != 3) {
//         resetWheel();
//     }
//     if (!keyboard_enabled) return false;
//     x = (x / display_scale).toInteger();
//     y = (y / display_scale).toInteger();
//     // insert down between two up, osx has this behavior for triple click
//     if (last_mouse_mask == 2 && mask == 2) {
//         handler.send_mouse((evt.buttons << 3) | 1, 0, 0, evt.altKey,
//                 evt.ctrlKey, evt.shiftKey, evt.commandKey);
//     }
//     last_mouse_mask = mask;
//     if (evt.buttons == 1) {
//         if (mask == 1) {
//             is_left_down = true;
//         } else if (mask == 2) {
//             is_left_down = false;
//         }
//     }
//     // to-do: altKey, ctrlKey etc
//     handler.send_mouse((evt.buttons << 3) | mask,
//                 mask == 3 ? wheel_delta_x : (mask == 0 ? x + display_origin_x : 0),
//                 mask == 3 ? wheel_delta_y : (mask == 0 ? y + display_origin_y : 0),
//                 evt.altKey,
//                 evt.ctrlKey, evt.shiftKey, evt.commandKey);
//     return true;
// };

// var cur_id = -1;
// var cur_hotx = 0;
// var cur_hoty = 0;
// var cur_img = null;
// var cur_x = 0;
// var cur_y = 0;
// var cur_local_x = 0;
// var cur_local_y = 0;
// var cursors = {};
// var image_binded;

// function scaleCursorImage(img) {
//     var w = (img.width * display_scale).toInteger();
//     var h = (img.height * display_scale).toInteger();
//     cursor_img.style.set {
//         width: w + "px",
//         height: h + "px",
//     };
//     self.bindImage("in-memory:cursor", img);
//     if (display_scale == 1) return img;
//     function paint(gfx) {
//         gfx.drawImage(img, 0, 0, w, h);
//     }
//     return new Image(w, h, paint);
// }

// var useSystemCursor = true;
// function updateCursor(system=false) {
//     stdout.println("Update cursor, system: " + system);
//     useSystemCursor = system;
//     if (system) {
//         handler.style#cursor = undefined;
//     } else if (cur_img) {
//         handler.style.cursor(cur_img, (cur_hotx * display_scale).toInteger(), (cur_hoty * display_scale).toInteger());
//     }
// }

// function refreshCursor() {
//     if (cur_id != -1) {
//         handler.setCursorId(cur_id);
//     }
// }

// handler.setCursorData = function(id, hotx, hoty, width, height, colors) {
//     cur_hotx = hotx;
//     cur_hoty = hoty;
//     var img = Image.fromBytes(colors);
//     if (img) {
//         image_binded = true;
//         cursors[id] = [img, hotx, hoty, width, height];
//         cur_id = id;
//         img = scaleCursorImage(img);
//         if (!first_mouse_event_triggered || cursor_img.style#display == 'none') {
//             self.timer(1ms, updateCursor);
//         }
//         cur_img = img;
//     }
// }

// handler.setCursorId = function(id) {
//     var img = cursors[id];
//     if (img) {
//         cur_id = id;
//         image_binded = true;
//         cur_hotx = img[1];
//         cur_hoty = img[2];
//         img = scaleCursorImage(img[0]);
//         if (!first_mouse_event_triggered || cursor_img.style#display == 'none') {
//             self.timer(1ms, updateCursor);
//         }
//         cur_img = img;
//     }
// }

// var got_mouse_control = true;
// handler.setCursorPosition = function(x, y) {
//     if (!image_binded) return;
//     got_mouse_control = false;
//     cur_x = x - display_origin_x;
//     cur_y = y - display_origin_y;
//     var x = cur_x - cur_hotx;
//     var y = cur_y - cur_hoty;
//     x *= display_scale / scaleFactor;
//     y *= display_scale / scaleFactor;
//     cursor_img.style.set {
//         left: x + "px",
//         top: y + "px",
//     };
//     if (cursor_img.style#display == 'none') {
//         cursor_img.style#display = "block";
//     }
// }

// function self.ready() {
//     var w = scaleIt(960);
//     var h = scaleIt(640);
//     if (is_file_transfer || is_port_forward) {
//         var r = handler.get_size();
//         if (isReasonableSize(r) && r[2] > 0) {
//             view.move(r[0], r[1], r[2], r[3]);
//         } else {
//             centerize(w, h);
//         }
//     } else {
//         centerize(w, h);
//     }
//     if (!is_port_forward) connecting();
//     if (is_file_transfer) initializeFileTransfer();
//     if (is_port_forward) initializePortForward();
// }

// var workarea_offset = 0;
// var size_adapted;
// handler.adaptSize = function() {
//     if (size_adapted) return;
//     size_adapted = true;
//     var (sx, sy, sw, sh) = view.screenBox(#workarea, #rectw);
//     var (fx, fy, fw, fh) = view.screenBox(#frame, #rectw);
//     if (is_osx) workarea_offset = sy;
//     var r = handler.get_size();
//     if (isReasonableSize(r) && r[2] > 0) {
//         if (r[2] >= fw && r[3] >= fh && !is_linux) {
//             view.windowState = View.WINDOW_FULL_SCREEN;
//             stdout.println("Initialize to full screen");
//         } else if (r[2] >= sw && r[3] >= sh) {
//             view.windowState = View.WINDOW_MAXIMIZED;
//             stdout.println("Initialize to full screen");
//         } else {
//             view.move(r[0], r[1], r[2], r[3]);
//         }
//     } else {
//         var w = handler.box(#width, #border)
//         var h = handler.box(#height, #border)
//         if (w >= sw || h >= sh) {
//             view.windowState = View.WINDOW_MAXIMIZED;
//             return;
//         }
//         // extra for border
//         var extra = 2;
//         centerize(w + extra, handler.box(#height, #border) + h + extra);
//     }
// }

// function self.closing() {
//     var (x, y, w, h) = view.box(#rectw, #border, #screen);
//     if (is_file_transfer) save_file_transfer_close_state();
//     if (is_file_transfer || is_port_forward || size_adapted) handler.save_size(x, y, w, h);
//     if (recording) handler.record_screen(false, display_width, display_height);
// }

// var qualityMonitor;
// var qualityMonitorData = [];

// class QualityMonitor: Reactor.Component
// {
//     function this() {
//         qualityMonitor = this;
//         if (handler.get_toggle_option("show-quality-monitor")) {
//             $(#quality-monitor).style.set{ display: "block" };
//         }
//     }

//     function render() {
//         return <div >
//             <div>
//                 Speed: {qualityMonitorData[0]}
//             </div>
//             <div>
//                 FPS: {qualityMonitorData[1]}
//             </div>
//             <div>
//                 Delay: {qualityMonitorData[2]} ms
//             </div>
//             <div>
//                 Target Bitrate: {qualityMonitorData[3]}kb
//             </div>
//             <div>
//                 Codec: {qualityMonitorData[4]}
//             </div>
//         </div>;
//     }
// }

// $(#quality-monitor).content(<QualityMonitor />);
// handler.updateQualityStatus = function(speed, fps, delay, bitrate, codec_format) {
//     speed ? qualityMonitorData[0] = speed:null;
//     fps ? qualityMonitorData[1] = fps:null;
//     delay ? qualityMonitorData[2] = delay:null;
//     bitrate ? qualityMonitorData[3] = bitrate:null;
//     codec_format ? qualityMonitorData[4] = codec_format:null;
//     qualityMonitor.update();
// }

// handler.setPermission = function(name, enabled) {
//     self.timer(60ms, function() {
//     if (name == "keyboard") keyboard_enabled = enabled;
//     if (name == "audio") audio_enabled = enabled;
//     if (name == "file") file_enabled = enabled;
//     if (name == "clipboard") clipboard_enabled = enabled;
//     if (name == "restart") restart_enabled = enabled;
//     if (name == "recording") recording_enabled = enabled;
//     input_blocked = false;
//     header.update();
//     });
// }

// handler.closeSuccess = function() {
//     // handler.msgbox("success", "Successful", "Ready to go.");
//     handler.msgbox("", "", "");
// }
