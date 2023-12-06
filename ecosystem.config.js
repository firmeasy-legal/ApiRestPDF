module.exports = {
	apps: [
		{
			name: 'editor_pdf_firmeasy',
			script: 'build/index.js',
			args: 'start',
			instances: 3,
			autorestart: true,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production'
			}
		}
	]
};