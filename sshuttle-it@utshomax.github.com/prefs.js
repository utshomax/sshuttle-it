'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.sshuttle-it');

    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create a new preferences row for the username key
    const usernameRow = new Adw.ActionRow({ title: 'User' });
    group.add(usernameRow);

    // Create a Gtk.Entry widget and set its initial value to the current setting
    const usernameEntry = new Gtk.Entry({ text: settings.get_string('user') });

    // Bind the Gtk.Entry widget's text property to the "username" key
    settings.bind(
        'user',
        usernameEntry,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the Gtk.Entry widget to the preferences row
    usernameRow.add_suffix(usernameEntry);

    // Create a new preferences row for the port key
    const portRow = new Adw.ActionRow({ title: 'Port' });
    group.add(portRow);

    // Create a Gtk.SpinButton widget and set its initial value to the current setting
    const portSpinButton = new Gtk.SpinButton({
        value: settings.get_int('port'),
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 65535,
            step_increment: 1,
            page_increment: 10,
            page_size: 0,
        })
    });

    // Bind the Gtk.SpinButton widget's value property to the "port" key
    settings.bind(
        'port',
        portSpinButton,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the Gtk.SpinButton widget to the preferences row
    portRow.add_suffix(portSpinButton);


    // Create a row for the use-key key (same as before)
    const useKeyRow = new Adw.ActionRow({ title: 'Use Key' });
    group.add(useKeyRow);

    // Create the switch and bind its value to the `use-key` key (same as before)
    const useKeyToggle = new Gtk.Switch({
        active: settings.get_boolean ('use-key'),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        'use-key',
        useKeyToggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the switch to the row (same as before)
    useKeyRow.add_suffix(useKeyToggle);
    useKeyRow.activatable_widget = useKeyToggle;
   // Create a new preferences row for the key_path key
    const keyPathRow = new Adw.ActionRow({ title: 'Key Path' });
    group.add(keyPathRow);

    // Create a Gtk.Entry widget and set its text to the current setting
    const keyPathEntry = new Gtk.Entry({
        text: settings.get_string('key-path')
    });

    // Bind the Gtk.Entry widget's text property to the "key_path" key
    settings.bind(
        'key-path',
        keyPathEntry,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the Gtk.Entry widget to the preferences row
    keyPathRow.add_suffix(keyPathEntry);



    // Create a new preferences row for the host key
    const hostRow = new Adw.ActionRow({ title: 'Host' });
    group.add(hostRow);

    // Create a Gtk.Entry widget and set its initial value to the current setting
    const hostEntry = new Gtk.Entry({ text: settings.get_string('host') });

    // Bind the Gtk.Entry widget's text property to the "host" key
    settings.bind(
        'host',
        hostEntry,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the Gtk.Entry widget to the preferences row
    hostRow.add_suffix(hostEntry);
    // Create a new preferences row for the save button
    const saveRow = new Adw.ActionRow({ title: '' });
    group.add(saveRow);

    // Create a Gtk.Button widget with the label "Save"
    const saveButton = new Gtk.Button({ label: 'Save' });

    // Add the save button to the preferences row
    saveRow.add_suffix(saveButton);

    // Bind the button to the saveSettings() function when clicked
    saveButton.connect('clicked', saveSettings);


    // Add our page to the window
    window.add(page);
}
function savePreferences() {
    settings.set_string('user', usernameEntry.get_text());
    settings.set_int('port', portSpinButton.get_value_as_int());
    settings.set_boolean('use-key', useKeyToggle.get_active());
    settings.set_string('key-path', keyPathEntry.get_text());
    settings.set_string('host', hostEntry.get_text());
}
// Callback function to save the settings
function saveSettings() {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
            'org.gnome.shell.extensions.sshuttle-it'
    );
    // Save the settings
    settings.save();
}
