const { Schema, model } = require('mongoose')

const User = new Schema({
	email: { type: String, unique: true, required: true },
	username: { type: String, required: true },
	password: { type: String, required: true, select: false },
	roles: [{ type: String, ref: 'Role' }],
	cardInfo: {
		type: Schema.Types.ObjectId,
		ref: 'CardInfo',
	},
})

module.exports = model('User', User)