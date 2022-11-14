import { invoke } from "@tauri-apps/api"
import React from "react";

export const translate = async (name: string) => {
    try {
        return await invoke<string>("t", { name: name });
    } catch(_) {
        return name;
    }
}

export const translate_text = async (text: string) => {
    if (text.indexOf('Failed') == 0 && text.indexOf(': ') > 0) {
        let fds = text.split(': ');
        for (var i = 0; i < fds.length; ++i) {
            fds[i] = await translate(fds[i]);
        }
        text = fds.join(': ');
    }
    return text;
}

// let msgboxTimerFunc = function() {}

// Просто закрывает 
// export const closeMsgbox = () => {
//     // self.timer(0, msgboxTimerFunc);
//     // $(#msgbox).content(<span />);
//     setInterval(msgboxTimerFunc, 0);

// }


// export class MsgboxComponent extends React.Component {
//     new(params: any) {
//         this.width = params.width;
//         this.height = params.height;
//         this.type = params.type;
//         this.title = params.title;
//         this.content = params.content;
//         this.link = params.link;
//         this.remember = params.remember;
//         this.callback = params.callback;
//         this.hasRetry = params.hasRetry;
//         this.auto_login = params.auto_login;
//         this.contentStyle = params.contentStyle;
//         try { this.content = translate_text(this.content); } catch (e) {}
//     }

//     getIcon(color) {
//         if (this.type == "input-password") {
//             return <svg viewBox="0 0 505 505"><circle cx="252.5" cy="252.5" r="252.5" fill={color}/><path d="M271.9 246.1c29.2 17.5 67.6 13.6 92.7-11.5 29.7-29.7 29.7-77.8 0-107.4s-77.8-29.7-107.4 0c-25.1 25.1-29 63.5-11.5 92.7L118.1 347.4l26.2 26.2 26.4 26.4 10.6-10.6-10.1-10.1 9.7-9.7 10.1 10.1 10.6-10.6-10.1-10 9.7-9.7 10.1 10.1 10.6-10.6-26.4-26.3 76.4-76.5z" fill="#fff"/><circle cx="337.4" cy="154.4" r="17.7" fill={color}/></svg>;
//         }
//         if (this.type == "connecting") {
//             return <svg viewBox="0 0 300 300"><g fill={color}><path d="m221.76 89.414h-143.51c-1.432 0-2.594 1.162-2.594 2.594v95.963c0 1.432 1.162 2.594 2.594 2.594h143.51c1.432 0 2.594-1.162 2.594-2.594v-95.964c0-1.431-1.162-2.593-2.594-2.593z"/><path d="m150 0c-82.839 0-150 67.161-150 150s67.156 150 150 150 150-67.163 150-150-67.164-150-150-150zm92.508 187.97c0 11.458-9.29 20.749-20.749 20.749h-47.144v11.588h23.801c4.298 0 7.781 3.483 7.781 7.781s-3.483 7.781-7.781 7.781h-96.826c-4.298 0-7.781-3.483-7.781-7.781s3.483-7.781 7.781-7.781h23.801v-11.588h-47.145c-11.458 0-20.749-9.29-20.749-20.749v-95.963c0-11.458 9.29-20.749 20.749-20.749h143.51c11.458 0 20.749 9.29 20.749 20.749v95.963z"/></g><path d="m169.62 154.35c-5.0276-5.0336-11.97-8.1508-19.624-8.1508-7.6551 0-14.597 3.1172-19.624 8.1508l-11.077-11.091c7.8656-7.8752 18.725-12.754 30.701-12.754s22.835 4.8788 30.701 12.754l-11.077 11.091zm-32.184 7.0728 12.56 12.576 12.56-12.576c-3.2147-3.2172-7.6555-5.208-12.56-5.208-4.9054 0-9.3457 1.9908-12.56 5.208zm12.56-39.731c14.403 0 27.464 5.8656 36.923 15.338l11.078-11.091c-12.298-12.314-29.276-19.94-48-19.94-18.724 0-35.703 7.626-48 19.94l11.077 11.091c9.4592-9.4728 22.52-15.338 36.923-15.338z" fill="#fff"/></svg>;
//         }
//         if (this.type == "success") {
//             return <svg viewBox="0 0 512 512"><circle cx="256" cy="256" r="256" fill={color} /><path fill="#fff" d="M235.472 392.08l-121.04-94.296 34.416-44.168 74.328 57.904 122.672-177.016 46.032 31.888z"/></svg>;
//         }
//         if (this.type.indexOf("error") >= 0 || this.type == "re-input-password") {
//             return <svg viewBox="0 0 512 512"><ellipse cx="256" cy="256" rx="256" ry="255.832" fill={color}/><g fill="#fff"><path d="M376.812 337.18l-39.592 39.593-201.998-201.999 39.592-39.592z"/><path d="M376.818 174.825L174.819 376.824l-39.592-39.592 201.999-201.999z"/></g></svg>;
//         }
//         return null;
//     }

//     getInputPasswordContent() {
//         var ts = this.remember ? { checked: true } : {};
//         return <div .form>
//             <div>{translate('Please enter your password')}</div>
//             <PasswordComponent />
//             <div><button|checkbox(remember) {ts}>{translate('Remember password')}</button></div>
//         </div>;
//     }

//     function getContent() {
//         if (this.type == "input-password") {
//             return this.getInputPasswordContent();
//         }
//         if (this.type == "custom-os-password") {
//             var ts = this.auto_login ? { checked: true } : {};
//             return <div .form>
//               <PasswordComponent value={this.content} />
//               <div><button|checkbox(auto_login) {ts} style="width: *; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; height: auto; overflow: hidden;">{translate('Auto Login')}</button></div>
//               </div>;
//         }
//         return this.content;
//     }

//     function getColor() {
//         if (this.type == "input-password"  || this.type == "custom-os-password") {
//             return "#AD448E";
//         }
//         if (this.type == "success") {
//             return "#32bea6";
//         }
//         if (this.type.indexOf("error") >= 0 || this.type == "re-input-password") {
//             return "#e04f5f";
//         }
//         return "#2C8CFF";
//     }

//     function hasSkip() {
//         return this.type.indexOf("skip") >= 0;
//     }

//     function render() {
//         this.set_outline_focus();
//         var color = this.getColor();
//         var icon = this.getIcon(color);
//         var content = this.getContent();
//         var hasCancel = this.type.indexOf("error") < 0 && this.type.indexOf("nocancel") < 0 && this.type != "restarting";
//         var hasOk = this.type != "connecting" && this.type != "success" && this.type.indexOf("nook") < 0;
//         var hasLink = this.link != "";
//         var hasClose = this.type.indexOf("hasclose") >= 0;
//         var show_progress = this.type == "connecting";
//         var me = this;
//         self.timer(0, msgboxTimerFunc);
//         msgboxTimerFunc = function() {
//             if (typeof content == "string")
//                 me.$(#content).html = translate(content);
//             else
//                 me.$(#content).content(content);
//         };
//         self.timer(3ms, msgboxTimerFunc);
//         return (<div><div style="position: absolute; size:*; background:black; opacity:0.5;" />
//         <div style="size: *; position: absolute;">
//             <div style={"border: " + color + " solid 1px; background: color(bg); margin: *; width:" + (this.width) + "px; min-height:" + (this.height) + "px"}>
//             <div .caption style={"background: " + color}>
//                 {translate(this.title)}
//             </div>
//             <div style="padding: 1em 2em; size: *;">
//                 <div style="height: *; flow: horizontal">
//                     {icon && <div style="height: *; margin: * 0; padding-right: 2em;" .msgbox-icon>{icon}</div>}
//                     <div style={this.contentStyle || "size: *; margin: * 0;"} #content />
//                 </div>
//                 <div style="text-align: right;">
//                     <span style="display:inline-block; max-width: 250px; font-size:12px;" #error />
//                     <progress #progress style={"color:" + color + "; display: " + (show_progress ? "inline-block" : "none")} />
//                     {hasCancel || this.hasRetry ? <button .button #cancel .outline>{translate(this.hasRetry ? "OK" : "Cancel")}</button> : ""}
//                     {this.hasSkip() ? <button .button #skip .outline>{translate('Skip')}</button> : ""}
//                     {hasOk || this.hasRetry ? <button .button #submit>{translate(this.hasRetry ? "Retry" : "OK")}</button> : ""}
//                     {hasLink ? <button .button #jumplink .outline>{translate('JumpLink')}</button> : ""}
//                     {hasClose ? <button .button #cancel .outline>{translate('Close')}</button> : ""}
//                 </div>
//             </div>
//             </div>
//         </div></div>);
//     }

//     event click $(.custom-event) (_, me) {
//         if (this.callback) this.callback(me);
//     }
    
//     function submit() {
//         if (this.$(button#submit)) {
//             this.$(button#submit).sendEvent("click");
//         }
//     }
    
//     function cancel() {
//         if (this.$(button#cancel)) {
//             this.$(button#cancel).sendEvent("click");
//         }
//     }
 
//     event click $(button#cancel) {
//         this.close();
//         if (this.callback) this.callback(null);
//     }
    
//     event click $(button#skip) {
//         var values = this.getValues();
//         values.skip = true;
//         if (this.callback) this.callback(values);
//         if (this.close) this.close();
//     }

//     event click $(button#jumplink) {
//         if (this.link.indexOf("http") == 0) {
//             Sciter.launch(this.link);
//         }
//     }
    
//     event click $(button#submit) {
//         if (this.type == "error") {
//             if (this.hasRetry) {
//                 retryConnect(true);
//                 return;
//             }
//         }
//         if (this.type == "re-input-password") {
//             this.type = "input-password";
//             this.update();
//             return;
//         }
//         var values = this.getValues();
//         if (this.callback) {
//             var self = this;
//             var err = this.callback(values, function(a=1, b='') { self.show_progress(a, b); });
//             if (!err) {
//                 if (this.close) this.close();
//                 return;
//             }
//             if (err && err.trim()) this.show_progress(false, err);
//         } else {
//             this.close();
//         }
//     }
    
//     event keydown (evt) {
//         if (!evt.shortcutKey) {
//             if (isEnterKey(evt)) {
//                 this.submit();
//             }
//             if (evt.keyCode == Event.VK_ESCAPE) {
//                 this.cancel();
//             }
//         }
//     }

//     event click $(button#select_directory) {
//         var folder = view.selectFolder(translate("Change"), $(#folderPath).text);
//         if (folder) {
//             if (folder.indexOf("file://") == 0) folder = folder.substring(7);
//             $(#folderPath).text = folder;
//         }
//     }
    
//     function show_progress(show=1, err="") {
//         if (show == -1) {
//             this.close()
//             return;
//         }
//         this.$(#progress).style.set {
//             display: show ? "inline-block" : "none"
//         };
//         this.$(#error).text = err;
//     }
    
//     function getValues() {
//         var values = { type: this.type };
//         for (var el in this.$$(.form input)) {
//             values[el.attributes["name"]] = el.value;
//         }
//         for (var el in this.$$(.form textarea)) {
//             values[el.attributes["name"]] = el.value;
//         }
//         for (var el in this.$$(.form button)) {
//             values[el.attributes["name"]] = el.value;
//         }
//         if (this.type == "input-password") {
//             values.password = (values.password || "").trim();
//             if (!values.password) {
//                 return;
//             }
//         }
//         return values;
//     }
    
//     function set_outline_focus() {
//         var me = this;
//         self.timer(30ms, function() {
//             var el = me.$(.outline-focus);
//             if (el) view.focus = el;
//             else {
//                 el = me.$(#submit);
//                 if (el) {
//                     view.focus = el;
//                 }
//             }
//         });
//     }

//     function close() {
//         closeMsgbox();
//     }
// }
