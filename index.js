const {init, setCount, notify, error} = require('./src/tray-app');
const {getMail} = require('./src/imap');
const settings = require('./src/settings');

const freq = (parseFloat(settings.get().freq) || 5) * 60000;  // 60000 = 1 min


function refresh () {
	getMail().then(updateCounter).catch(error);
}


function updateCounter (emails) {
	const count = (emails || []).length;
	const news = emails.filter(msg => msg.new);

	setCount(count);
	notify(news);

	setTimeout(refresh, freq);
}

init(refresh);
