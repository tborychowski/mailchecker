const imaps = require('imap-simple');
const settings = require('./settings');

let lastChecked;


function timeAgo (date) {
	const intervals = [
		{ label: 'year', seconds: 31536000 },
		{ label: 'month', seconds: 2592000 },
		{ label: 'day', seconds: 86400 },
		{ label: 'hour', seconds: 3600 },
		{ label: 'minute', seconds: 60 },
		{ label: 'second', seconds: 0 }
	];
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	const interval = intervals.find(i => i.seconds < seconds);
	const count = Math.floor(seconds / interval.seconds);
	return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
}

function parseMessage (msg) {
	const body = msg.parts.find(part => part.which === 'HEADER').body;
	const from = body.from[0];
	const subject = body.subject[0];
	const date = new Date(body.date[0]);
	const ago = timeAgo(date);
	return {from, subject, date, ago};
}

function searchInbox (connection) {
	const searchCriteria = ['UNSEEN'];
	const fetchOptions = {bodies: ['HEADER', 'TEXT'], markSeen: false };
	return connection
		.openBox('INBOX')
		.then(() => connection.search(searchCriteria, fetchOptions))
		.then(res => {
			connection.end();
			return res;
		});
}

function getMail () {
	const imap = Object.assign({}, settings.get(), { tls: true, authTimeout: 3000 });
	return imaps
		.connect({ imap })
		.then(searchInbox)
		.then(res => res.map(parseMessage))
		.then(emails => {
			emails.forEach(msg => {
				if (!lastChecked || msg.date > lastChecked) msg.new = true;
			});
			lastChecked = new Date();
			return emails;
		});
}

module.exports = {
	getMail
};
