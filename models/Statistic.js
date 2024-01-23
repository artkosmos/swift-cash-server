const { Schema, model } = require('mongoose')

const statisticSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	statistic: {
		income: { type: Number, default: 0, required: true },
		expense: { type: Number, default: 0, required: true }
	}
})

module.exports = model('Statistic', statisticSchema)