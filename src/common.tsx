import { appWindow, WebviewWindow } from '@tauri-apps/api/window'
import { invoke } from "@tauri-apps/api"

// const [monitorWidth, monitorHeight, scaleFactor] = await invoke<
//         [number, number, number]
//       >("get_monitor_size")

let OS = await invoke<string>("get_os");

let is_osx = OS == "OSX";
let is_win = OS == "Windows";
let is_linux = OS == "Linux";
let is_file_transfer: boolean;
let is_xfce = false;

try { is_xfce = await invoke<boolean>("is_xfce"); } catch(e) {}

// TODO: Проверка на энтер, переписать на React
// function isEnterKey(evt) {
//     return (evt.keyCode == Event.VK_ENTER || 
//              (is_osx && evt.keyCode == 0x4C) ||
//               (is_linux && evt.keyCode == 65421));
// }

// TODO: dip to pixel
// function getScaleFactor() {
//     if (!is_win) return 1;
//     return self.toPixels(10000dip) / 10000.;
// }

// var scaleFactor = getScaleFactor();
let scaleFactor = 1;

// TODO: on resolution change refrash scaleFactor

export const scaleIt = (x: number) => {
    return (x * scaleFactor) as number;
}
console.log("scaleFactor", scaleFactor);

/******************** end of chatbox ****************************************/

/******************** start of msgbox ****************************************/
// let remember_password = false;
// export const msgbox = (type: string, title: string, content: string, link="", callback=null, height=180, width=500, hasRetry=false, contentStyle="") => {
//     // $(body).scrollTo(0, 0);
//     if (!type) {
//         // closeMsgbox();
//         return;
//     }
//     var remember = false;
//     try { remember = await invoke<boolean>("get_remember");} catch(e) {}
//     var auto_login = false;
//     try { auto_login = await invoke<string>("get_option", {"key": "auto-login"}) != ''; } catch(e) {}
//     width += is_xfce ? 50 : 0;
//     height += is_xfce ? 50 : 0;

//     if (type.indexOf("input-password") >= 0) {
//         callback = function (res: any) {
//             if (!res) {
//                 // view.close();
//                 return;
//             }
//             await invoke("login", {"password": res.password, "remember": res.remember}); 
//             if (!is_port_forward) {
//               // Specially handling file transfer for no permission hanging issue (including 60ms
//               // timer in setPermission.
//               // For wrong password input hanging issue, we can not use handler.msgbox.
//               // But how about wrong password for file transfer?
//               if (is_file_transfer) handler.msgbox("connecting", "Connecting...", "Logging in...");
//               else msgbox("connecting", "Connecting...", "Logging in...");
//             }
//         };
//     } else if (type.indexOf("custom") < 0 && !is_port_forward && !callback) {
//         callback = function() { view.close(); }
//     }
//     $(#msgbox).content(<MsgboxComponent width={width} height={height} auto_login={auto_login} type={type} title={title} content={content} link={link} remember={remember} callback={callback} contentStyle={contentStyle} hasRetry={hasRetry} />);
// }

// function connecting() {
//     handler.msgbox("connecting", "Connecting...", "Connection in progress. Please wait.");
// }

// handler.msgbox = function(type, title, text, link = "", hasRetry=false) {
//     // crash somehow (when input wrong password), even with small time, for example, 1ms
//     self.timer(60ms, function() { msgbox(type, title, text, link, null, 180, 500, hasRetry); });
// }

// var reconnectTimeout = 1000;
// handler.msgbox_retry = function(type, title, text, link, hasRetry) {
//     handler.msgbox(type, title, text, link, hasRetry);
//     if (hasRetry) {
//         self.timer(0, retryConnect);
//         self.timer(reconnectTimeout, retryConnect);
//         reconnectTimeout *= 2;
//     } else {
//         reconnectTimeout = 1000;
//     }
// }

// function retryConnect(cancelTimer=false) {
//     if (cancelTimer) self.timer(0, retryConnect);
//     if (!is_port_forward) connecting();
//     handler.reconnect();
// }
// /******************** end of msgbox ****************************************/

// function Progress()
// {
//     var _val;
//     var pos = -0.25;

//     function step() {
//         if( _val !== undefined ) { this.refresh(); return false; }
//         pos += 0.02;
//         if( pos > 1.25)
//             pos = -0.25;
//         this.refresh();
//         return true;
//     }

//     function paintNoValue(gfx)
//     {
//         var (w,h) = this.box(#dimension,#inner);
//         var x = pos * w;
//         w = w * 0.25;
//         gfx.fillColor( this.style#color )
//              .pushLayer(#inner-box)
//              .rectangle(x,0,w,h)
//              .popLayer();
//         return true;
//     }

//     this[#value] = property(v) {
//         get return _val;
//         set {
//             _val = undefined;
//             pos = -0.25;
//             this.paintContent = paintNoValue;
//             this.animate(step);
//             this.refresh();
//         }
//     }

//     this.value = "";
// }

// var svg_eye_cross = <svg viewBox="0 -21 511.96 511">
// <path d="m506.68 261.88c7.043-16.984 7.043-36.461 0-53.461-41.621-100.4-140.03-165.27-250.71-165.27-46.484 0-90.797 11.453-129.64 32.191l-68.605-68.609c-8.3438-8.3398-21.824-8.3398-30.168 0-8.3398 8.3398-8.3398 21.824 0 30.164l271.49 271.49 86.484 86.488 68.676 68.672c4.1797 4.1797 9.6406 6.2695 15.102 6.2695 5.4609 0 10.922-2.0898 15.082-6.25 8.3438-8.3398 8.3438-21.824 0-30.164l-62.145-62.145c36.633-27.883 66.094-65.109 84.438-109.38zm-293.91-100.1c12.648-7.5742 27.391-11.969 43.199-11.969 47.062 0 85.332 38.273 85.332 85.336 0 15.805-4.3945 30.547-11.969 43.199z"/>
// <path d="m255.97 320.48c-47.062 0-85.336-38.273-85.336-85.332 0-3.0938 0.59766-6.0195 0.91797-9.0039l-106.15-106.16c-25.344 24.707-46.059 54.465-60.117 88.43-7.043 16.98-7.043 36.457 0 53.461 41.598 100.39 140.01 165.27 250.69 165.27 34.496 0 67.797-6.3164 98.559-18.027l-89.559-89.559c-2.9844 0.32031-5.9062 0.91797-9 0.91797z"/>
// </svg>;

// class PasswordComponent: Reactor.Component {
//     this var visible = false;
//     this var value = '';
//     this var name = 'password';
    
//     function this(params) {
//       if (params && params.value) {
//           this.value = params.value;
//       }
//       if (params && params.name) {
//           this.name = params.name;
//       }
//     }

//     function render() {
//         return <div .password>
//             <input name={this.name} value={this.value} type={this.visible ? "text" : "password"} .outline-focus />
//             {this.visible ? svg_eye_cross : svg_eye}
//         </div>;
//     }

//     event click $(svg) {
//         var el = this.$(input);
//         var value = el.value;
//         var start = el.xcall(#selectionStart) || 0;
//         var end = el.xcall(#selectionEnd);
//         this.update({ visible: !this.visible });
//         var me = this;
//         self.timer(30ms, function() {
//             var el = me.$(input);
//             view.focus = el;
//             el.value = value;
//             el.xcall(#setSelection, start, end);
//         });
//     }
// }

// // type: #post, #get, #delete, #put
// function httpRequest(url, type, params, _onSuccess, _onError, headers="") {
//     if (type != #post) {
//         stderr.println("only post ok");
//     }
//     handler.post_request(url, JSON.stringify(params), headers);
//     function check_status() {
//         var status = handler.get_async_job_status();
//         if (status == " ") self.timer(0.1s, check_status);
//         else {
//             try {
//                 var data = JSON.parse(status);
//                 _onSuccess(data);
//             } catch (e) {
//                 _onError(status, 0);
//             }
//         }
//     }
//     check_status();
// }

// function isReasonableSize(r) {
//     var x = r[0];
//     var y = r[1];
//     var n = scaleIt(3200);
//     return !(x < -n || x > n || y < -n || y > n);
// }

// function awake() {
//     view.windowState = View.WINDOW_SHOWN;
//     view.focus = self;
// }

