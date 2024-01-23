const { Schema, model } = require('mongoose')

const CardInfo = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	cardNumber: {
		type: String,
		required: true,
		unique: true
	},
	cardHolderName: {
		type: String,
		required: true
	},
	expirationDate: {
		type: String,
		required: true
	},
	cvv: {
		type: String,
		required: true
	},
	balance: {
		type: Number,
		default: 0
	},
	isBlocked: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = model('CardInfo', CardInfo)