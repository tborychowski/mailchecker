const {BrowserWindow, ipcMain, systemPreferences} = require('electron');
const Store = require('electron-store');
const store = new Store();
let _window, onSaveCallbacks = [];

function getWin () {
	if (_window) return Promise.resolve(_window);

	return new Promise(resolve => {
		_window = new BrowserWindow({
			width: 360,
			height: 380,
			show: false,
			resizable: false,
			frame: false,
			vibrancy: 'appearance-based'
		});
		_window.on('closed', () => { _window = null; });
		_window.on('ready-to-show', () => {
			setMode();
			passSettings();
			setTimeout(() => resolve(_window), 100);
		});
		_window.loadURL(`file://${__dirname}/settings.html`);
	});
}

const open = () => getWin().then(win => win.show());
const get = () => store.get('settings', {});
const empty = () => !store.get('settings');
const passSettings = () => _window.webContents.send('settings', get());
const on = (ev, cb) => { if (ev === 'save') onSaveCallbacks.push(cb); };


function setMode () {
	const isDark = systemPreferences.isDarkMode();
	_window.webContents.send('isDark', isDark);
	_window.setVibrancy(isDark ? 'dark' : 'light');
}


ipcMain.on('settings', (event, arg) => {
	const {action, data} = arg;

	if (action === 'save') store.set('settings', data);
	if (action === 'close' || action === 'save') _window.hide();
});


systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', setMode);
store.onDidChange('settings', data => onSaveCallbacks.forEach(cb => cb(data)));

module.exports = {
	open,
	get,
	empty,
	on,
};
