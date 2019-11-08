let http = require('http');

module.exports = class HttpError extends Error{
	constructor(status='', message){
		super();
		this.status = status;
		this.message = message || http.STATUS_CODES[status] || "Error";
		this.name = 'HttpError';
		/*if (status instanceof Error){
			this.name = status.name;
			this.message = status.message;
			this.stack = status.stack;
			this.status = 500;
		}else{
			this.status = status || 500;
			this.name = 'HttpError';

			if (error instanceof Error){
				this.name = error.name;
				this.message = error.message;
				this.stack = error.stack;
			}
			else if (typeof error == "string"){
				this.message = error;
			}

			if (!this.message)
				this.message = http.STATUS_CODES[status] || 'Error';
		}*/
	}

};

