const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label } = format;

function getLogger(module){
	let path = module.filename.split('/').slice(-2).join('/');

	return new createLogger({
		format: combine(
			format.colorize(),
			label({ label: path }),
			timestamp(),
			format.printf(
				info => `${info.level}: [${info.label}] ${info.message}. ${info.timestamp} `)
			),
		/*transports: [
			new transports.Console({
			}),
			]*/
		});
}

module.exports = getLogger;
