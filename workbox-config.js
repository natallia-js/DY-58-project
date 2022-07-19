/**
 * Based on workbox-config.js configuration file, we can generate the Service Worker for caching the app.
 * We can do this with the following command:
 * workbox generateSW workbox-config.js
 */
module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,ico,ttf,woff,eot,png,svg,html,js,mp3}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};
