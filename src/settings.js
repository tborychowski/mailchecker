const {BrowserWindow, ipcMain, nativeTheme} = require('electron');
const Store = require('electron-store');
const store = new Store();
let _window, onSaveCallbacks = [];

function getWin () {
	if (_window) return Promise.resolve(_window);

	return new Promise(resolve => {
		_window = new BrowserWindow({
			width: 360,
			height: 400,
			show: false,
			resizable: false,
			webPreferences: {
				nodeIntegration: true
			}
		});
		_window.on('closed', () => { _window = null; });
		_window.on('ready-to-show', () => {
			_window.webContents.send('settings', get());
			_window.webContents.send('isDark', nativeTheme.shouldUseDarkColors);
			setTimeout(() => resolve(_window), 100);
		});
		_window.loadURL(`file://${__dirname}/settings.html`);
	});
}

function open () {
	getWin().then(win => win.show());
}

const get = () => store.get('settings', {});
const empty = () => !store.get('settings');
const on = (ev, cb) => { if (ev === 'save') onSaveCallbacks.push(cb); };


ipcMain.on('settings', (event, arg) => {
	const {action, data} = arg;
	if (action === 'save') store.set('settings', data);
	if (action === 'close' || action === 'save') _window.hide();
});

store.onDidChange('settings', data => onSaveCallbacks.forEach(cb => cb(data)));


module.exports = {
	open,
	get,
	empty,
	on,
};
