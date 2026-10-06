var storage = require('./storage.js');
var seeds = require('./seeds.js');

var TOKEN_PREFIX = 'sf-demo-';

function isLoggedIn() {
	return isDemoToken(storage.getDemo('token'));
}

function isDemoToken(token) {
	return typeof token === 'string' && token.indexOf(TOKEN_PREFIX) === 0 && token.length > TOKEN_PREFIX.length;
}

function login(username, password) {
	var user = String(username || '').trim();
	var pass = String(password || '');
	if (user !== seeds.DEMO_CREDENTIALS.username || pass !== seeds.DEMO_CREDENTIALS.password) {
		return {ok: false, message: '账号或密码错误'};
	}
	var token = TOKEN_PREFIX + String(seeds.DEMO_USER.id);
	storage.setDemo('token', token);
	storage.setDemo('userInfo', seeds.DEMO_USER);
	storage.setDemo('username', seeds.DEMO_USER.name);
	storage.setDemo('avatarUrl', '');
	return {ok: true, token: token, user: seeds.DEMO_USER};
}

function logout() {
	storage.clearSessionStorage();
}

function currentUser() {
	return storage.getDemo('userInfo', null) || seeds.DEMO_USER;
}

function currentToken() {
	return storage.getDemo('token');
}

module.exports = {
	TOKEN_PREFIX: TOKEN_PREFIX,
	isLoggedIn: isLoggedIn,
	isDemoToken: isDemoToken,
	login: login,
	logout: logout,
	currentUser: currentUser,
	currentToken: currentToken
};
