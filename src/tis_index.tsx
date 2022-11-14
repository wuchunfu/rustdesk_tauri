// if (is_osx) view.windowBlurbehind = #light;
// stdout.println("current platform:", OS);
// stdout.println("is_xfce: ", is_xfce);

// // html min-width, min-height not working on mac, below works for all
// view.windowMinSize = (scaleIt(560), scaleIt(300));

// var app;
// var tmp = handler.get_connect_status();
// var connect_status = tmp[0];
// var service_stopped = handler.get_option("stop-service") == "Y";
// var rendezvous_service_stopped = false;
// var using_public_server = handler.using_public_server();
// var software_update_url = "";
// var key_confirmed = tmp[1];
// var system_error = "";

// var svg_menu = <svg #menu viewBox="0 0 512 512">
// 	<circle cx="256" cy="256" r="64"/>
// 	<circle cx="256" cy="448" r="64"/>
// 	<circle cx="256" cy="64" r="64"/>
// </svg>;
// var svg_refresh_password = <svg #refresh-password xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>;

// var my_id = "";
// function get_id() {
//   my_id = handler.get_id();
//   return my_id;
// }

// class ConnectStatus: Reactor.Component {
//     function render() {
//         return
//             <div .connect-status>
//                 <span class={"connect-status-icon connect-status" + (service_stopped ? 0 : connect_status)} />
//                 {this.getConnectStatusStr()}
//                 {service_stopped ? <span .link #start-service>{translate('Start Service')}</span> : ""}
//             </div>;
//     }

//     function getConnectStatusStr() {
//         if (service_stopped) {
//             return translate("Service is not running");
//         } else if (connect_status == -1) {
//             return translate('not_ready_status');
//         } else if (connect_status == 0) {
//             return translate('connecting_status');
//         }
//         if (!handler.using_public_server()) return translate('Ready');
//         return <span>{translate("Ready")}, <span .link #setup-server>{translate("setup_server_tip")}</span></span>;
//     }

//     event click $(#start-service) () {
//         handler.set_option("stop-service", "");
//     }

//     event click $(#setup-server) () {
//         handler.open_url("https://rustdesk.com/blog/id-relay-set/");
//     }
// }

// function createNewConnect(id, type) {
//     id = id.replace(/\s/g, "");
//     app.remote_id.value = formatId(id);
//     if (!id) return;
//     if (id == my_id) {
//         msgbox("custom-error", "Error", "You cannot connect to your own computer");
//         return;
//     }
//     handler.set_remote_id(id);
//     handler.new_remote(id, type);
// }

// class ShareRdp: Reactor.Component {
//     function render() {
//         var rdp_shared_string = translate("Enable RDP session sharing");
//         var cls = handler.is_share_rdp()  ? "selected" : "line-through";
//         return <li class={cls}><span>{svg_checkmark}</span>{rdp_shared_string}</li>;
//     }
    
//     function onClick() {
//         handler.set_share_rdp(!handler.is_share_rdp());
//         this.update();
//     }
// }

// var direct_server;
// class DirectServer: Reactor.Component {
//     function this() {
//         direct_server = this;
//     }

//     function render() {
//         var text = translate("Enable Direct IP Access");
//         var enabled = handler.get_option("direct-server") == "Y";
//         var cls = enabled ? "selected" : "line-through";
//         return <li class={cls}><span>{svg_checkmark}</span>{text}{enabled && <EditDirectAccessPort />}</li>;
//     }
    
//     function onClick() {
//         if (is_edit_rdp_port) {
//             is_edit_rdp_port = false;
//             return;
//         }
//         handler.set_option("direct-server", handler.get_option("direct-server") == "Y" ? "" : "Y");
//         this.update();
//     }
// }

// var myIdMenu;
// var audioInputMenu;
// class AudioInputs: Reactor.Component {
//     function this() {
//         audioInputMenu = this;
//     }

//     function render() {
//         if (!this.show) return <li />;
//         var inputs = handler.get_sound_inputs();
//         if (is_win) inputs = ["System Sound"].concat(inputs);
//         if (!inputs.length) return <li style="display:hidden" />;
//         var me = this;
//         self.timer(1ms, function() { me.toggleMenuState() });
//         return <li>{translate('Audio Input')}
//             <menu #audio-input key={inputs.length}>
//                 <li #enable-audio><span>{svg_checkmark}</span>{translate("Mute")}</li>
//                 <div .separator />
//                 {inputs.map(function(name) {
//                 return <li id={name}><span>{svg_checkmark}</span>{translate(name)}</li>;
//                 })}
//             </menu>
//         </li>;
//     }

//     function get_default() {
//         if (is_win) return "System Sound";
//         return "";
//     }

//     function get_value() {
//         return handler.get_option("audio-input") || this.get_default();
//     }

//     function toggleMenuState() {
//         var el = this.$(li#enable-audio);
//         var enabled = handler.get_option(el.id) != "N";
//         el.attributes.toggleClass("selected", !enabled);
//         var v = this.get_value();
//         for (var el in this.$$(menu#audio-input>li)) {
//             if (el.id == 'enable-audio') continue;
//             var selected = el.id == v;
//             el.attributes.toggleClass("selected", selected);
//         }
//     }

//     event click $(menu#audio-input>li) (_, me) {
//         var v = me.id;
//         if (v == 'enable-audio') {
//             handler.set_option(v, handler.get_option(v) != 'N' ? 'N' : '');
//         } else {
//           if (v == this.get_value()) return;
//           if (v == this.get_default()) v = "";
//           handler.set_option("audio-input", v);
//         }
//         this.toggleMenuState();
//     }
// };

// class Languages: Reactor.Component {
//     function render() {
//         var langs = JSON.parse(handler.get_langs());
//         var me = this;
//         self.timer(1ms, function() { me.toggleMenuState() });
//         return <li>{translate('Language')}
//             <menu #languages key={langs.length}>
//                 <li id="default"><span>{svg_checkmark}</span>Default</li>
//                 <div .separator />
//                 {langs.map(function(lang) {
//                 return <li id={lang[0]}><span>{svg_checkmark}</span>{lang[1]}</li>;
//                 })}
//             </menu>
//         </li>;
//     }


//     function toggleMenuState() {
//         var cur = handler.get_local_option("lang") || "default";
//         for (var el in this.$$(menu#languages>li)) {
//             var selected = cur == el.id;
//             el.attributes.toggleClass("selected", selected);
//         }
//     }

//     event click $(menu#languages>li) (_, me) {
//         var v = me.id;
//         if (v == "default") v = "";
//         handler.set_local_option("lang", v);
//         app.update();
//         this.toggleMenuState();
//     }
// }

// var enhancementsMenu;
// class Enhancements: Reactor.Component {
//     function this() {
//         enhancementsMenu = this;
//     }

//     function render() {
//         var has_hwcodec = handler.has_hwcodec();
//         var me = this;
//         self.timer(1ms, function() { me.toggleMenuState() });
//         return <li>{translate('Enhancements')}
//             <menu #enhancements-menu>
//                 {has_hwcodec ? <li #enable-hwcodec><span>{svg_checkmark}</span>{translate("Hardware Codec")} (beta)</li> : ""}
//                 <li #enable-abr><span>{svg_checkmark}</span>{translate("Adaptive Bitrate")} (beta)</li>
//                 <li #screen-recording>{translate("Recording")}</li>
//             </menu>
//         </li>;
//     }

//     function toggleMenuState() {
//         for (var el in $$(menu#enhancements-menu>li)) {
//             if (el.id && el.id.indexOf("enable-") == 0) {
//                 var enabled = handler.get_option(el.id) != "N";
//                 el.attributes.toggleClass("selected", enabled);
//             }
//         }

//     }

//     event click $(menu#enhancements-menu>li) (_, me) {
//         var v = me.id;
//         if (v.indexOf("enable-") == 0) {
//             handler.set_option(v, handler.get_option(v) != 'N' ? 'N' : '');
//         } else if (v == 'screen-recording') {
//             var dir = handler.get_option("video-save-directory");
//             if (!dir) dir = handler.default_video_save_directory();
//             var ts0 = handler.get_option("enable-record-session") == '' ? { checked: true } : {};
//             var ts1 = handler.get_option("allow-auto-record-incoming") == 'Y' ? { checked: true } : {};
//             msgbox("custom-recording", translate('Recording'),
//                 <div .form>
//                     <div><button|checkbox(enable_record_session) {ts0}>{translate('Enable Recording Session')}</button></div>
//                     <div><button|checkbox(auto_record_incoming) {ts1}>{translate('Automatically record incoming sessions')}</button></div>
//                     <div>
//                         <div style="word-wrap:break-word"><span>{translate("Directory")}:&nbsp;&nbsp;</span><span #folderPath>{dir}</span></div>
//                         <div> <button #select_directory .link>{translate('Change')}</button> </div>
//                     </div>
//                 </div>
//                 , "", function(res=null) {
//                 if (!res) return;
//                 handler.set_option("enable-record-session", res.enable_record_session ? '' : 'N');
//                 handler.set_option("allow-auto-record-incoming", res.auto_record_incoming ? 'Y' : '');
//                 handler.set_option("video-save-directory", $(#folderPath).text);
//             });
//         }
//         this.toggleMenuState();
//     }
// }

// function getUserName() {
//     try {
//         return JSON.parse(handler.get_local_option("user_info")).name;
//     } catch(e) {}
//     return '';
// }

// function updateTheme() {
//     var root_element = self;
//     if (handler.get_option("allow-darktheme") == "Y") {
//         // enable dark theme
//         root_element.attributes.toggleClass("darktheme", true);
//     } else {
//         // disable dark theme
//         root_element.attributes.toggleClass("darktheme", false);
//     }
// }

// class MyIdMenu: Reactor.Component {
//     function this() {
//         myIdMenu = this;
//     }

//     function render() {
//         return <div #myid>
//             {this.renderPop()}
//             ID{svg_menu}
//         </div>;
//     }

//     function renderPop() {
//         var username = handler.get_local_option("access_token") ? getUserName() : '';
//         return <popup>
//             <menu.context #config-options>
//                 <li #enable-keyboard><span>{svg_checkmark}</span>{translate('Enable Keyboard/Mouse')}</li>
//                 <li #enable-clipboard><span>{svg_checkmark}</span>{translate('Enable Clipboard')}</li>
//                 <li #enable-file-transfer><span>{svg_checkmark}</span>{translate('Enable File Transfer')}</li> 
//                 <li #enable-remote-restart><span>{svg_checkmark}</span>{translate('Enable Remote Restart')}</li> 
//                 <li #enable-tunnel><span>{svg_checkmark}</span>{translate('Enable TCP Tunneling')}</li>
//                 <li #enable-lan-discovery><span>{svg_checkmark}</span>{translate('Enable LAN Discovery')}</li>
//                 <AudioInputs />
//                 <Enhancements />
//                 <li #allow-remote-config-modification><span>{svg_checkmark}</span>{translate('Enable remote configuration modification')}</li>
//                 <div .separator />
//                 <li #custom-server>{translate('ID/Relay Server')}</li>
//                 <li #whitelist title={translate('whitelist_tip')}>{translate('IP Whitelisting')}</li>
//                 <li #socks5-server>{translate('Socks5 Proxy')}</li>
//                 <div .separator />
//                 <li #stop-service class={service_stopped ? "line-through" : "selected"}><span>{svg_checkmark}</span>{translate("Enable Service")}</li>
//                 {handler.is_rdp_service_open() ? <ShareRdp /> : ""}
//                 <DirectServer />
//                 {false && handler.using_public_server() && <li #allow-always-relay><span>{svg_checkmark}</span>{translate('Always connected via relay')}</li>}
//                 {handler.has_rendezvous_service() ? <li #stop-rendezvous-service>{translate(rendezvous_service_stopped ? "Start ID/relay service" : "Stop ID/relay service")}</li> : ""}
//                 {handler.is_ok_change_id() ? <div .separator /> : ""}
//                 {username ? 
//                 <li #logout>{translate('Logout')} ({username})</li> :
//                 <li #login>{translate('Login')}</li>}
//                 {handler.is_ok_change_id() && key_confirmed ? <li #change-id>{translate('Change ID')}</li> : ""}
//                 <div .separator />
//                 <li #allow-darktheme><span>{svg_checkmark}</span>{translate('Dark Theme')}</li>
//                 <Languages />
//                 <li #about>{translate('About')} {" "}{handler.get_app_name()}</li>
//             </menu>
//         </popup>;
//     }

//     event click $(svg#menu) (_, me) {
//         this.showSettingMenu();
//     }

//     function showSettingMenu() {
//         audioInputMenu.update({ show: true });
//         this.toggleMenuState();
//         if (direct_server) direct_server.update();
//         var menu = this.$(menu#config-options);
//         this.$(svg#menu).popup(menu);
//     }

//     event click $(li#login) () {
//         login();
//     }

//     event click $(li#logout) () {
//         logout();
//     }

//     function toggleMenuState() {
//         for (var el in $$(menu#config-options>li)) {
//             if (el.id && el.id.indexOf("enable-") == 0) {
//                 var enabled = handler.get_option(el.id) != "N";
//                 el.attributes.toggleClass("selected", enabled);
//                 el.attributes.toggleClass("line-through", !enabled);
//             }
//             if (el.id && el.id.indexOf("allow-") == 0) {
//                 var enabled = handler.get_option(el.id) == "Y";
//                 el.attributes.toggleClass("selected", enabled);
//                 el.attributes.toggleClass("line-through", !enabled);
//             }
//         }
//     }

//     function showAbout() {
//         var name = handler.get_app_name();
//         msgbox("custom-nocancel-nook-hasclose", "About " + name, "<div style='line-height: 2em'> \
//             <div>Version: " + handler.get_version() + " \
//             <div .link .custom-event url='https://rustdesk.com/privacy'>Privacy Statement</div> \
//             <div .link .custom-event url='https://rustdesk.com'>Website</div> \
//             <div style='background: #2c8cff; color: white; padding: 1em; margin-top: 1em;'>Copyright &copy; 2022 Purslane Ltd.\
//             <br />" + handler.get_license() + " \
//             <p style='font-weight: bold'>Made with heart in this chaotic world!</p>\
//             </div>\
//         </div>", "", function(el) {
//             if (el && el.attributes) {
//                 handler.open_url(el.attributes['url']);
//             };
//         }, 400);
//     }

//     event click $(menu#config-options>li) (_, me) {
//         if (me.id && me.id.indexOf("enable-") == 0) {
//             handler.set_option(me.id, handler.get_option(me.id) == "N" ? "" : "N");
//         }
//         if (me.id && me.id.indexOf("allow-") == 0) {
//             handler.set_option(me.id, handler.get_option(me.id) == "Y" ? "" : "Y");
//         }
//         if (me.id == "whitelist") {
//             var old_value = handler.get_option("whitelist").split(",").join("\n");
//             msgbox("custom-whitelist", translate("IP Whitelisting"), "<div .form> \
//             <div>" + translate("whitelist_sep") + "</div> \
//             <textarea .outline-focus spellcheck=\"false\" name=\"text\" novalue=\"0.0.0.0\" style=\"overflow: scroll-indicator; width:*; height: 140px; font-size: 1.2em; padding: 0.5em;\">" + old_value + "</textarea>\
//             </div> \
//             ", "", function(res=null) {
//                 if (!res) return;
//                 var value = (res.text || "").trim();
//                 if (value) {
//                     var values = value.split(/[\s,;\n]+/g);
//                     for (var ip in values) {
//                         if (!ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
//                             return translate("Invalid IP") + ": " + ip;
//                         }
//                     }
//                     value = values.join("\n");
//                 }
//                 if (value == old_value) return;
//                 stdout.println("whitelist updated");
//                 handler.set_option("whitelist", value.replace("\n", ","));
//             }, 300);
//         } else if (me.id == "custom-server") {
//             var configOptions = handler.get_options();
//             var old_relay = configOptions["relay-server"] || "";
//             var old_api = configOptions["api-server"] || "";
//             var old_id = configOptions["custom-rendezvous-server"] || "";
//             var old_key = configOptions["key"] || "";
//             msgbox("custom-server", "ID/Relay Server", "<div .form .set-password> \
//             <div><span>" + translate("ID Server") + ": </span><input|text .outline-focus name='id' value='" + old_id + "' /></div> \
//             <div><span>" + translate("Relay Server") + ": </span><input|text name='relay' value='" + old_relay + "' /></div> \
//             <div><span>" + translate("API Server") + ": </span><input|text name='api' value='" + old_api + "' /></div> \
//             <div><span>" + translate("Key") + ": </span><input|text name='key' value='" + old_key + "' /></div> \
//             </div> \
//             ", "", function(res=null) {
//                 if (!res) return;
//                 var id = (res.id || "").trim();
//                 var relay = (res.relay || "").trim();
//                 var api = (res.api || "").trim().toLowerCase();
//                 var key = (res.key || "").trim();
//                 if (id == old_id && relay == old_relay && key == old_key && api == old_api) return;
//                 if (id) {
//                     var err = handler.test_if_valid_server(id);
//                     if (err) return translate("ID Server") + ": " + err;
//                 }
//                 if (relay) {
//                     var err = handler.test_if_valid_server(relay);
//                     if (err) return translate("Relay Server") + ": " + err;
//                 }
//                 if (api) {
//                     if (0 != api.indexOf("https://") && 0 != api.indexOf("http://")) {
//                         return  translate("API Server") + ": " + translate("invalid_http");
//                     }
//                 }
//                 configOptions["custom-rendezvous-server"] = id;
//                 configOptions["relay-server"] = relay;
//                 configOptions["api-server"] = api;
//                 configOptions["key"] = key;
//                 handler.set_options(configOptions);
//             }, 260);
//         } else if (me.id == "socks5-server") {
//             var socks5 = handler.get_socks() || {};
//             var old_proxy = socks5[0] || "";
//             var old_username = socks5[1] || "";
//             var old_password = socks5[2] || "";
//             msgbox("custom-server", "Socks5 Proxy", <div .form .set-password> 
//             <div><span>{translate("Hostname")}:</span><input|text .outline-focus name='proxy' value={old_proxy} /></div>
//             <div><span>{translate("Username")}:</span><input|text name='username' value={old_username} /></div>
//             <div><span>{translate("Password")}:</span><PasswordComponent value={old_password} /></div>
//             </div>
//             , "", function(res=null) {
//                 if (!res) return;
//                 var proxy = (res.proxy || "").trim();
//                 var username = (res.username || "").trim();
//                 var password = (res.password || "").trim();
//                 if (proxy == old_proxy && username == old_username && password == old_password) return;
//                 if (proxy) {
//                     var err = handler.test_if_valid_server(proxy);
//                     if (err) return translate("Server") + ": " + err;
//                 }
//                 handler.set_socks(proxy, username, password);
//             }, 240);
//         } else if (me.id == "stop-service") {
//             handler.set_option("stop-service", service_stopped ? "" : "Y");
//         } else if (me.id == "stop-rendezvous-service") {
//             handler.set_option("stop-rendezvous-service",  rendezvous_service_stopped ? "" : "Y");
//         } else if (me.id == "change-id") {
//             msgbox("custom-id", translate("Change ID"), "<div .form .set-password> \
//             <div>" + translate('id_change_tip') + " </div> \
//             <div><span style='width: 100px; display:inline-block'>ID: </span><input|text .outline-focus style='width: 250px' name='id' /></div> \
//             </div> \
//             ", "", function(res=null, show_progress) {
//                 if (!res) return;
//                 show_progress();
//                 var id = (res.id || "").trim();
//                 if (!id) return;
//                 if (id == my_id) return;
//                 handler.change_id(id);
//                 function check_status() {
//                     var status = handler.get_async_job_status();
//                     if (status == " ") self.timer(0.1s, check_status);
//                     else {
//                         if (status) show_progress(false, translate(status));
//                         else show_progress(-1);
//                     }
//                 }
//                 check_status();
//                 return " ";
//             });
//         } else if (me.id == "allow-darktheme") {
//             updateTheme();
//         } else if (me.id == "about") {
//             this.showAbout()
//         }
//     }
// }

// var is_edit_direct_access_port;
// class EditDirectAccessPort: Reactor.Component {
//     function render() {
//         return <span style="margin-left: 12px; padding: 0 6px; display: inline-block;" .link>{svg_edit}</span>;
//     }

//     function onMouse(evt) {
//         if (evt.type == Event.MOUSE_DOWN) {
//             is_edit_direct_access_port = true;
//             editDirectAccessPort();
//         }
//     }
// }

// function editDirectAccessPort() {
//     var p0 = handler.get_option('direct-access-port');
//     var port = p0 ? <input|text name='port' value={p0} /> :
//                     <input|text name='port' novalue={21118} />;
//     msgbox("custom-direct-access-port", translate('Direct IP Access Settings'), <div .form .set-password>
//             <div><span style="width: 60px;">{translate('Port')}:</span>{port}</div>
//         </div>, "", function(res=null) {
//         if (!res) return;
//         var p = (res.port || '').trim();
//         if (p) {
//             p = p.toInteger();
//             if (!(p > 0)) {
//                 return translate("Invalid port");
//             }
//             p = p + '';
//         }
//         if (p != p0) handler.set_option('direct-access-port', p);
//       });
// }

// class App: Reactor.Component
// {
//     function this() {
//         app = this;
//     }

//     function render() {
//         var is_can_screen_recording = handler.is_can_screen_recording(false);
//         return
//             <div .app>
//                     <div .left-pane>
//                     <div>
//                         <div .title>{translate('Your Desktop')}</div>
//                         <div .lighter-text>{translate('desk_tip')}</div>
//                         <div .your-desktop>
//                             <MyIdMenu />
//                             {key_confirmed ? <input type="text" readonly value={formatId(get_id())}/> : translate("Generating ...")}
//                         </div>
//                         <PasswordArea />
//                     </div>
//                     {!is_win || handler.is_installed() ? "": <InstallMe />}
//                     {software_update_url ? <UpdateMe /> : ""}
//                     {is_win && handler.is_installed() && !software_update_url && handler.is_installed_lower_version() ? <UpgradeMe /> : ""}
//                     {is_can_screen_recording ? "": <CanScreenRecording />}
//                     {is_can_screen_recording && !handler.is_process_trusted(false) ? <TrustMe /> : ""}
//                     {!service_stopped && is_can_screen_recording && handler.is_process_trusted(false) && handler.is_installed() && !handler.is_installed_daemon(false) ? <InstallDaemon /> : ""}
//                     {system_error ? <SystemError /> : ""}
//                     {!system_error && handler.is_login_wayland() && !handler.current_is_wayland() ? <FixWayland /> : ""}
//                     {!system_error && handler.current_is_wayland() ? <ModifyDefaultLogin /> : ""}
//                 </div>
//                 <div .right-pane>
//                     <div .right-content>
//                         <div .card-connect>
//                             <div .title>{translate('Control Remote Desktop')}</div>
//                             <ID @{this.remote_id} />
//                             <div .right-buttons>
//                                 <button .button .outline #file-transfer>{translate('Transfer File')}</button>
//                                 <button .button #connect>{translate('Connect')}</button>
//                             </div>
//                         </div>
//                         <MultipleSessions @{this.multipleSessions} />
//                     </div>
//                     <ConnectStatus @{this.connect_status} />
//                 </div>
//                 <div #overlay style="position: absolute;size:*;background:black;opacity:0.5;display:none" />
//             </div>;
//     }

//     event click $(button#connect) {
//         this.newRemote("connect");
//     }

//     event click $(button#file-transfer) {
//         this.newRemote("file-transfer");
//     }

//     function newRemote(type) {
//         createNewConnect(this.remote_id.value, type);
//     }
// }

// class InstallMe: Reactor.Component {
//     function render() {
//         return <div .install-me>
//             <span />
//             <div>{translate('install_tip')}</div>
//             <div><button #install-me .button>{translate('Install')}</button></div>
//         </div>;
//     }

//     event click $(#install-me) {
//         handler.goto_install();
//     }
// }

// function download(from, to, args..) {
//     var rqp = { type:#get, url: from, toFile: to };
//     var fn = 0;
//     var on = 0;
//     for( var p in args ) {
//         if( p instanceof Function ) {
//             switch(++fn) {
//                 case 1: rqp.success = p; break;
//                 case 2: rqp.error = p; break;
//                 case 3: rqp.progress = p; break;
//             }
//         } else if( p instanceof Object ) {
//             switch(++on) {
//                 case 1: rqp.params = p; break;
//                 case 2: rqp.headers = p; break;
//             }
//         }  
//     }
//     view.request(rqp);
// }

// // current running version is higher than installed
// class UpgradeMe: Reactor.Component {
//     function render() {
//         var update_or_download = is_osx ? "download" : "update";
//         return <div .install-me>
//             <div>{translate('Status')}</div>
//             <div>{translate('Your installation is lower version.')}</div>
//             <div #install-me.link>{translate('Click to upgrade')}</div>
//         </div>;
//     }

//     event click $(#install-me) {
//         handler.update_me("");
//     }
// }

// class UpdateMe: Reactor.Component {
//     function render() {
//         var update_or_download = "download"; // !is_win ? "download" : "update";
//         return <div .install-me>
//             <div>{translate('Status')}</div>
//             <div>There is a newer version of {handler.get_app_name()} ({handler.get_new_version()}) available.</div>
//             <div #install-me.link>{translate('Click to ' + update_or_download)}</div>
//             <div #download-percent style="display:hidden; padding-top: 1em;" />
//         </div>;
//     }

//     event click $(#install-me) {
//         handler.open_url("https://rustdesk.com");
//         return;
//         if (!is_win) {
//             handler.open_url("https://rustdesk.com");
//             return;
//         }
//         var url = software_update_url + '.' + handler.get_software_ext();
//         var path = handler.get_software_store_path();
//         var onsuccess = function(md5) {
//             $(#download-percent).content(translate("Installing ..."));
//             handler.update_me(path);
//         };
//         var onerror = function(err) {
//             msgbox("custom-error", "Download Error", "Failed to download"); 
//         };
//         var onprogress = function(loaded, total) {
//             if (!total) total = 5 * 1024 * 1024;
//             var el = $(#download-percent);
//             el.style.set{display: "block"};
//             el.content("Downloading %" + (loaded * 100 / total));
//         };
//         stdout.println("Downloading " + url + " to " + path);
//         download(
//             url,
//             self.url(path),
//             onsuccess, onerror, onprogress);
//     }
// }

// class SystemError: Reactor.Component {
//     function render() {
//         return <div .install-me>
//             <div>{system_error}</div>
//         </div>;
//     }
// }

// class TrustMe: Reactor.Component {
//     function render() {
//         return <div .trust-me #trust-me-box>
//             <div>{translate('Permissions')}</div>
//             <div>{translate('config_acc')}</div>
//             <div #trust-me .link>{translate('Configure')}</div>
//             <div #help-me .link>{translate('Help')}</div>
//         </div>;
//     }

//     event click $(#trust-me) {
//         handler.is_process_trusted(true);
//         watch_trust();
//     }
    
//     event click $(#help-me) {
//         handler.open_url(translate("doc_mac_permission"));
//     }
// }

// class CanScreenRecording: Reactor.Component {
//     function render() {
//         return <div .trust-me #screen-recording-box>
//             <div>{translate('Permissions')}</div>
//             <div>{translate('config_screen')}</div>
//             <div #screen-recording .link>{translate('Configure')}</div>
//             <div #help-me .link>{translate('Help')}</div>
//         </div>;
//     }

//     event click $(#screen-recording) {
//         handler.is_can_screen_recording(true);
//         watch_screen_recording();
//     }
    
//     event click $(#help-me) {
//         handler.open_url(translate("doc_mac_permission"));
//     }
// }

// class InstallDaemon: Reactor.Component {
//     function render() {
//         return <div .install-me>
//             <span />
//             <div>{translate('install_daemon_tip')}</div>
//             <div #install-me.link>{translate('Install')}</div>
//         </div>;
//     }

//     event click $(#install-me) {
//         handler.is_installed_daemon(true);
//     }
// }

// class FixWayland: Reactor.Component {
//     function render() {
//         return <div .trust-me>
//             <div>{translate('Warning')}</div>
//             <div>{translate('Login screen using Wayland is not supported')}</div>
//             <div #help-me .link>{translate('Help')}</div>
//         </div>;
//     }

//     event click $(#fix-wayland) {
//         handler.fix_login_wayland();
//         app.update();
//     }
    
//     event click $(#help-me) {
//         handler.open_url(translate("doc_fix_wayland"));
//     }
// }

// class ModifyDefaultLogin: Reactor.Component {
//     function render() {
//         return <div .trust-me>
//             <div>{translate('Warning')}</div>
//             <div>{translate('Current Wayland display server is not supported')}</div>
//             <div #help-me .link>{translate('Help')}</div>
//         </div>;
//     }

//     event click $(#modify-default-login) {
//         if (var r = handler.modify_default_login()) {
//             // without handler, will fail, fucking stupid sciter
//             handler.msgbox("custom-error", "Error", r);
//         }
//         app.update();
//     }
    
//     event click $(#help-me) {
//         handler.open_url(translate("doc_fix_wayland"));
//     }
// }

// function watch_trust() {
//     // not use TrustMe::update, because it is buggy
//     var trusted = handler.is_process_trusted(false);
//     var el = $(div#trust-me-box);
//     if (el) {
//         el.style.set {
//             display: trusted ? "none" : "block",
//         };
//     }
//     if (trusted) {
//         app.update();
//         return;
//     }
//     self.timer(1s, watch_trust);
// }

// function watch_screen_recording() {
//     var trusted = handler.is_can_screen_recording(false);
//     var el = $(div#screen-recording-box);
//     if (el) {
//         el.style.set {
//             display: trusted ? "none" : "block",
//         };
//     }
//     if (trusted) {
//         app.update();
//         return;
//     }
//     self.timer(1s, watch_screen_recording);
// }

// class PasswordEyeArea : Reactor.Component {
//     render() {
//         var method = handler.get_option('verification-method');
//         var value = method != 'use-permanent-password' ? password_cache[0] : "-";
//         return
//             <div .eye-area style="width: *">
//                 <input|text @{this.input} readonly value={value} />
//                 {svg_refresh_password}
//             </div>;
//     }

//     event click $(svg#refresh-password) (_, me) {
//         handler.update_temporary_password();
//         this.update();
//     }
// }

// var temporaryPasswordLengthMenu;
// class TemporaryPasswordLengthMenu: Reactor.Component {
//     function this() {
//         temporaryPasswordLengthMenu = this;
//     }

//     function render() {
//         if (!this.show) return <li />;
//         var me = this;
//         var method = handler.get_option('verification-method');
//         self.timer(1ms, function() { me.toggleMenuState() });
//         return <li disabled={ method == 'use-permanent-password' ? "true" : "false" }>{translate("Set temporary password length")}
//             <menu #temporary-password-length>
//                 <li #temporary-password-length-6><span>{svg_checkmark}</span>6</li>
//                 <li #temporary-password-length-8><span>{svg_checkmark}</span>8</li>
//                 <li #temporary-password-length-10><span>{svg_checkmark}</span>10</li>
//             </menu>
//         </li>;
//     }

//     function toggleMenuState() {
//         var length = handler.get_option("temporary-password-length");
//         var index = ['6', '8', '10'].indexOf(length);
//         if (index < 0) index = 0;
//         for (var (i, el) in this.$$(menu#temporary-password-length>li)) {
//             el.attributes.toggleClass("selected", i == index);
//         }
//     }

//     event click $(menu#temporary-password-length>li) (_, me) {
//         var length = me.id.substring('temporary-password-length-'.length);
//         var old_length = handler.get_option('temporary-password-length');
//         if (length != old_length) {
//             handler.set_option('temporary-password-length', length);
//             handler.update_temporary_password();
//             this.toggleMenuState();
//             passwordArea.update();
//         }
//     }
// }

// var passwordArea;
// class PasswordArea: Reactor.Component {
//     function this() {
//         passwordArea = this;
//     }

//     function render() {
//         var me = this;
//         self.timer(1ms, function() { me.toggleMenuState() });
//         return 
//         <div .your-desktop>
//             <div>{translate('Password')}</div>
//             <div .password style="flow:horizontal">
//                 {this.renderPop()}
//                 <PasswordEyeArea />
//                 {svg_edit}
//             </div>
//         </div>;
//     }

//     function renderPop() {
//         var method = handler.get_option('verification-method');
//         return <popup><menu.context #edit-password-context>
//             <li #use-temporary-password><span>{svg_checkmark}</span>{translate('Use temporary password')}</li>
//             <li #use-permanent-password><span>{svg_checkmark}</span>{translate('Use permanent password')}</li>
//             <li #use-both-passwords><span>{svg_checkmark}</span>{translate('Use both passwords')}</li>
//             <div .separator />
//             <li #set-password  disabled={ method == 'use-temporary-password' ? "true" : "false" }>{translate('Set permanent password')}</li>
//             <TemporaryPasswordLengthMenu />
//         </menu></popup>;
//     }

//     function toggleMenuState() {
//         var id = handler.get_option('verification-method');
//         if (id != 'use-temporary-password' && id != 'use-permanent-password')
//             id = 'use-both-passwords';
//         for (var el in [this.$(li#use-temporary-password), this.$(li#use-permanent-password), this.$(li#use-both-passwords)]) {
//             el.attributes.toggleClass("selected", el.id == id);
//         }
//     }

//     event click $(svg#edit) (_, me) {
//         temporaryPasswordLengthMenu.update({show: true });
//         var menu = $(menu#edit-password-context);        
//         me.popup(menu);
//     }

//     event click $(li#set-password) {
//         var me = this;
//         var password = handler.permanent_password();
//         var value_field = password.length == 0 ? "" : "value=" + password;
//         msgbox("custom-password", translate("Set Password"), "<div .form .set-password> \
//             <div><span>" + translate('Password') + ":</span><input|password(password) .outline-focus " + value_field + " /></div> \
//             <div><span>" + translate('Confirmation') + ":</span><input|password(confirmation) " + value_field + " /></div> \
//         </div> \
//         ", "", function(res=null) {
//             if (!res) return;
//             var p0 = (res.password || "").trim();
//             var p1 = (res.confirmation || "").trim();
//             if (p0.length < 6) {
//                 return translate("Too short, at least 6 characters.");
//             }
//             if (p0 != p1) {
//                 return translate("The confirmation is not identical.");
//             }
//             handler.set_permanent_password(p0);
//             me.update();
//         });
//     }

//     event click $(menu#edit-password-context>li) (_, me) {
//         if (me.id.indexOf('use-') == 0) {
//             handler.set_option('verification-method', me.id);
//             this.toggleMenuState();
//             passwordArea.update();
//         }
//     }
// }

// var password_cache = ["","",""];
// function updatePasswordArea() {
//     self.timer(1s, function() {
//         var temporary_password = handler.temporary_password();
//         var verification_method = handler.get_option('verification-method');
//         var temporary_password_length = handler.get_option('temporary-password-length');
//         var update = false;
//         if (password_cache[0] != temporary_password) {
//             password_cache[0] = temporary_password;
//             update = true;
//         }
//         if (password_cache[1] != verification_method) {
//             password_cache[1] = verification_method;
//             update = true;
//         }
//         if (password_cache[2] != temporary_password_length) {
//             password_cache[2] = temporary_password_length;
//             update = true;
//         }
//         if (update) passwordArea.update();
//         updatePasswordArea();
//     });                          
// }
// updatePasswordArea();

// class ID: Reactor.Component {
//     function render() {
//         return <input type="text" #remote_id .outline-focus novalue={translate("Enter Remote ID")} maxlength="21"
//         value={formatId(handler.get_remote_id())} />;
//     }

//     // https://github.com/c-smile/sciter-sdk/blob/master/doc/content/sciter/Event.htm
//     event change {
//         var fid = formatId(this.value);
//         var d = this.value.length - (this.old_value || "").length;
//         this.old_value = this.value;
//         var start = this.xcall(#selectionStart) || 0;
//         var end = this.xcall(#selectionEnd);
//         if (fid == this.value || d <= 0 || start != end) {
//             return;
//         }
//         // fix Caret position
//         this.value = fid;
//         var text_after_caret = this.old_value.substr(start);
//         var n = fid.length - formatId(text_after_caret).length;
//         this.xcall(#setSelection, n, n);
//     }
// }

// var reg = /^\d+$/;
// function formatId(id) {
//     id = id.replace(/\s/g, "");
//     if (reg.test(id) && id.length > 3) {
//         var n = id.length;
//         var a = n % 3 || 3;
//         var new_id = id.substr(0, a);
//         for (var i = a; i < n; i += 3) {
//             new_id += " " + id.substr(i, 3);
//         }
//         return new_id;
//     }
//     return id;
// }

// event keydown (evt) {
//     if (view.focus && view.focus.id != 'remote_id') {
//         return;
//     }
//     if (!evt.shortcutKey) {
//         if (isEnterKey(evt)) {
//             var el = $(button#connect);
//             view.focus = el;
//             el.sendEvent("click");
//             // simulate button click effect, windows does not have this issue
//             el.attributes.toggleClass("active", true);
//             self.timer(0.3s, function() {
//                 el.attributes.toggleClass("active", false);
//             });
//         }
//     }
// }

// $(body).content(<div style="size:*"><App /><div #msgbox /></div>);

// function self.closing() {
//     var (x, y, w, h) = view.box(#rectw, #border, #screen);
//     handler.closing(x, y, w, h);
//     return true;
// }

// function self.ready() {
//     var r = handler.get_size();
//     if (isReasonableSize(r) && r[2] > 0) {
//         var (sx, sy, sw, sh) = view.screenBox(#workarea, #rectw);
//         if (r[2] >= sw && r[3] >= sh) {
//             self.timer(1ms, function() { view.windowState = View.WINDOW_MAXIMIZED; });
//         } else {
//             view.move(r[0], r[1], r[2], r[3]);
//         }
//     } else {
//         centerize(scaleIt(800), scaleIt(600));
//     }
//     if (!handler.get_remote_id()) {
//         view.focus = $(#remote_id);
//     }
//     refreshCurrentUser();
//     updateTheme();
// }

// function showAbout() {
//     myIdMenu.showAbout();
// }

// function showSettings() {
//     if ($(#overlay).style#display == 'block') return;
//     myIdMenu.showSettingMenu();
// }

// function checkConnectStatus() {
//     handler.check_mouse_time(); // trigger connection status updater
//     self.timer(1s, function() {
//         var tmp = !!handler.get_option("stop-service");
//         if (tmp != service_stopped) {
//             service_stopped = tmp;
//             app.update();
//         }
//         tmp = !!handler.get_option("stop-rendezvous-service");
//         if (tmp != rendezvous_service_stopped) {
//             rendezvous_service_stopped = tmp;
//             myIdMenu.update();
//         }
//         tmp = handler.using_public_server();
//         if (tmp != using_public_server) {
//             using_public_server = tmp;
//             app.connect_status.update();
//         }
//         tmp = handler.get_connect_status();
//         if (tmp[0] != connect_status) {
//             connect_status = tmp[0];
//             app.connect_status.update();
//         }
//         if (tmp[1] != key_confirmed) {
//             key_confirmed = tmp[1];
//             app.update();
//         }
//         if (tmp[2] && tmp[2] != my_id) {
//             stdout.println("id updated");
//             app.update();
//         }
//         tmp = handler.get_error();
//         if (system_error != tmp) {
//             system_error = tmp;
//             app.update();
//         }
//         tmp = handler.get_software_update_url();
//         if (tmp != software_update_url) {
//             software_update_url = tmp;
//             app.update();
//         }
//         if (handler.recent_sessions_updated()) {
//             stdout.println("recent sessions updated");
//             updateAbPeer();
//             app.update();
//         }
//         check_if_overlay();
//         checkConnectStatus();    
//     });                          
// }                                
                                 
// var enter = false;               
// function self.onMouse(evt) {     
//     switch(evt.type) {           
//     case Event.MOUSE_ENTER:    
//         enter = true;
//         check_if_overlay();
//         break;
//     case Event.MOUSE_LEAVE:
//         $(#overlay).style#display = 'none';
//         enter = false;
//         break;
//     }
// }

// function check_if_overlay() {
//     if (!handler.get_option('allow-remote-config-modification')) {
//         var time0 = getTime();
//         handler.check_mouse_time();
//         self.timer(120ms, function() {
//             if (!enter) return;
//             var d = time0 - handler.get_mouse_time();
//             if (d < 120) $(#overlay).style#display = 'block';
//         });
//     }
// }

// checkConnectStatus();

// function login() {
//     var name0 = getUserName();
//     var pass0 = '';
//     msgbox("custom-login", translate('Login'), <div .form .set-password> 
//             <div><span>{translate('Username')}:</span><input|text name="username" value={name0} .outline-focus /></div> 
//             <div><span>{translate('Password')}:</span><PasswordComponent value={pass0} /></div> 
//         </div>, "", function(res=null, show_progress) {
//         if (!res) return;
//         show_progress();
//         var name = (res.username || '').trim();
//         if (!name) {
//             show_progress(false, translate("Username missed"));
//             return " ";
//         }
//         var pass = (res.password || '').trim();
//         if (!pass) {
//             show_progress(false, translate("Password missed"));
//             return " ";
//         }
//         abLoading = true;
//         var url = handler.get_api_server();
//         httpRequest(url + "/api/login", #post, {username: name, password: pass, id: my_id, uuid: handler.get_uuid()}, function(data) {
//             if (data.error) {
//                 abLoading = false;
//                 var err = translate(data.error);
//                 show_progress(false, err);
//                 return;
//             }
//             handler.set_local_option("access_token", data.access_token);
//             handler.set_local_option("user_info", JSON.stringify(data.user));
//             show_progress(-1);
//             myIdMenu.update();
//             getAb();
//         }, function(err, status) {
//             abLoading = false;
//             err = translate(err);
//             if (url.indexOf('rustdesk') < 0) err = url + ', ' + err;
//             show_progress(false, err);
//         });
//         return " ";
//       });
// }

// function reset_token() {
//     handler.set_local_option("access_token", "");
//     handler.set_local_option("user_info", "");
//     handler.set_local_option("selected-tags", "");
//     myIdMenu.update();
//     resetAb();
//     if (abComponent) {
//         abComponent.update();
//     }
// }

// function logout() {
//     var url = handler.get_api_server();
//     httpRequest(url + "/api/logout", #post, {id: my_id, uuid: handler.get_uuid()}, function(data) {
//     }, function(err, status) {
//         msgbox("custom-error", translate('Error'), err);
//     }, getHttpHeaders());
//     reset_token();
// }

// function refreshCurrentUser() {
//     if (!handler.get_local_option("access_token")) return;
//     abLoading = true;
//     abError = "";
//     app.update();
//     httpRequest(handler.get_api_server() + "/api/currentUser", #post, {id: my_id, uuid: handler.get_uuid()}, function(data) {
//         if (data.error) {
//             handleAbError(data.error);
//             return;
//         }
//         handler.set_local_option("user_info", JSON.stringify(data));
//         myIdMenu.update();
//         getAb();
//     }, function(err, status) {
//         if (status == 401 || status == 400) {
//             reset_token();
//         }
//         handleAbError(err);
//     }, getHttpHeaders());
// } 

// function getHttpHeaders() {
//     return "Authorization: Bearer " + handler.get_local_option("access_token");
// }
