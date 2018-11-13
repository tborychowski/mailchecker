const {app, shell, Menu, Tray, Notification} = require('electron');
const path = require('path');
const settings = require('./settings');


const iconsPath = path.resolve(__dirname, '..', 'icons');
const ICON = {
	MAIL: path.join(iconsPath, 'iconTemplate.png'),
	EMPTY: path.join(iconsPath, 'iconDimmedTemplate.png')
};

let tray, refreshCb;

const inbox = () => shell.openExternal(settings.get().url);
const notify = news => news.forEach(toast);

settings.on('save', () => refreshCb());

function toast ({from, ago, subject})  {
	const notif = new Notification({ title: from, subtitle: ago, body: subject });
	notif.on('click', inbox);
	notif.show();
}


function init (cb) {
	refreshCb = cb;
	app.dock.hide();
	app.on('ready', () => {
		tray = new Tray(ICON.EMPTY);
		refreshCb();
		if (settings.empty()) settings.open();
	});
}


function setMenu (count) {
	const label = count ? `${count} new email${count > 1 ? 's' : ''}` : 'No new emails';
	const menu = Menu.buildFromTemplate([
		{ label, enabled: false },
		{ type: 'separator' },
		{ label: 'Refresh', click: refreshCb },
		{ label: 'Open Inbox', click: inbox },
		{ type: 'separator' },
		{ label: 'Settings', click: settings.open },
		{ label: 'Quit', role: 'quit' }
	]);
	tray.setContextMenu(menu);
}


function setCount (count) {
	setMenu(count);
	tray.setImage(count > 0 ? ICON.MAIL : ICON.EMPTY);
}


function error (e) {
	if (e.code === 'ECONNREFUSED') settings.open();
	else console.log(e);
}

module.exports = {
	init,
	setCount,
	notify,
	error
};
