const { Schema, model } = require('mongoose')

const transactionSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	transactions: [
		{
			createdAt: {
				type: Date,
				default: Date.now
			},
			amount: {
				type: Number,
				required: true
			},
			type: {
				type: String,
				enum: ['top-up', 'withdraw'],
				required: true
			}
		}
	]
})

module.exports = model('Transaction', transactionSchema)