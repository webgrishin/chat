let crypto = require('crypto');

let mongoose = require('lib/mongoose'),
  Schema = mongoose.Schema;

let schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password) {
	let User = this;
	return User.findOne({username: username})
	.then((user)=>{
		if (user) {
			if (user.checkPassword(password)) {
				return user;
			} else {
				 throw new AuthError("Пароль неверен");
			}
		} else {
			let user = new User({username: username, password: password});
			user.save(function(err) {
				if (err)
					throw err;
				return user;
			});
		}
	})
	.catch((e)=>{
		throw e;
	});

};

exports.User = mongoose.model('User', schema);

class AuthError extends Error{
	constructor(message){
		super(message);
		this.name = 'AuthError';
	}
}
exports.AuthError = AuthError;

