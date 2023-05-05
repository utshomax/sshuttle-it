const { Gio, GLib, Clutter, St } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;



class SSHuttleVPN {
  constructor() {
    log(`initializing ${Me.metadata.name}`);
    this._indicator = null;
  }

  enable() {
    log('enabling...')
    this.settings = ExtensionUtils.getSettings(
      'org.gnome.shell.extensions.sshuttle-it')
    this._indicatorName = `${Me.metadata.name} Indicator`;
    this._icon = new St.Icon({
      gicon: new Gio.ThemedIcon({ name: 'security-low' }),
      style_class: 'system-status-icon'
    });
    this._indicator = new PanelMenu.Button(0.0, this._indicatorName, false);
    this._indicator.add_child(this._icon);
    this._indicator.connect('button-press-event', () => this._toggle());
    Main.panel.addToStatusArea(this._indicatorName, this._indicator);
    log('indicator created')

    this._connected = false;
    this._process = null;
    //get the settings values
    let host = this.settings.get_string('host')
    let port = this.settings.get_int('port')
    let user = this.settings.get_string('user')
    let key_path = this.settings.get_string('key-path')
    let use_key = this.settings.get_boolean('use-key')
    
    let ssh_cmd = null
    if (use_key){
      ssh_cmd = 'ssh -i ' + key_path + " -o 'StrictHostKeyChecking no'"
    }
    else{
      ssh_cmd = "ssh -o 'StrictHostKeyChecking no'"
    }
    this._script = `pkexec sshuttle -r "${user}@${host}:${port}" 0/0 --ssh-cmd "${ssh_cmd}" -vv --dns`
  }

  disable() {
    log(`disabling ${Me.metadata.name}`);
    this._indicator.destroy();
    this._indicator = null;
  }

  _disconnect(){
    if (this._process) {
      log('disabling...')
      let pid = this._process.get_identifier()
      log('process id : ' + pid)
      let res = GLib.spawn_command_line_async('pkexec pkill -P ' + pid);
      log('process stopped with status : ' + res[0])
      this._process = null;
      this._connected = false;
      this._updateIcon();
    }
  }
  _toggle() {
    log('toggling')
    log('connected : ' + this._connected)
    if (this._connected) {
      this._disconnect();
    } else {
      this._connect();
    }
  }

  _connect(input = null, cancellable = null) {
    let argv = ['bash', '-c', this._script]
    if(this._process && this._connected){
      log('already connected')
      return
    }
    if(this._process && this._connected === false){
      log('A process is already running but vpn not connected')
      this._disconnect()
      return
    }
    try{
      let flags = (Gio.SubprocessFlags.STDOUT_PIPE |
        Gio.SubprocessFlags.STDERR_PIPE);

      if (input !== null)
          flags |= Gio.SubprocessFlags.STDIN_PIPE;

      log('Executing command : "' + argv + '"')
      this._process = Gio.Subprocess.new(argv, flags);
      this._connected = true;
      this._updateIcon();
      return new Promise((resolve, reject) => {
        this._process.communicate_utf8_async(input, cancellable, (proc, res) => {
              try {
                  let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                  if (!proc.get_successful()) {
                      let status = proc.get_exit_status();
                      this._connected = false;
                      this._updateIcon();
                      log('Error in command - status : '+ status);

                      /*throw new Gio.IOErrorEnum({
                          code: Gio.io_error_from_errno(status),
                          message: stderr ? stderr.trim() : GLib.strerror(status)
                      });*/
                  }
                  this._callback(stdout);
                  resolve(stdout);
              } catch (e) {
                  this._disconnect()
                  reject(e);
              }
          });
      });
    } catch (e) {
        this._disconnect()
        return Promise.reject(e);
    }
  }
  _callback( stdout) {
      log('In :' + stdout)
      let entries = [];
      let outputAsOneLine = '';

      if (stdout) {
          stdout.split('\n').map(line => entries.push(line));
          entries.forEach(output => {
              outputAsOneLine = outputAsOneLine + output;
          });
      } else {
          outputAsOneLine = '';
      }
      log('Out :' + outputAsOneLine)
      
  }
  _updateIcon() {
    if (this._connected) {
      this._icon.gicon = new Gio.ThemedIcon({ name: 'security-high' });
    } else {
      this._icon.gicon = new Gio.ThemedIcon({ name: 'security-low' });
    }
  }
}

function init() {
    log(`initializing ${Me.metadata.name}`);
    
    return new SSHuttleVPN();
}