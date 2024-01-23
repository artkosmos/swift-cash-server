const User = require('./models/User')
const Role = require('./models/Role')
const Transactions = require('./models/Transactions')
const Statistic = require('./models/Statistic')
const CardInfo = require('./models/CardInfo')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const generateAccessToken = require('./utils/generate-access-token')
const getUsernameFromEmail = require('./utils/make-user-name')
const generateRandomValue = require('./utils/get-random-number')

class ServerController {
	async registration(req, res) {
		try {
			const error = validationResult(req)
			if (!error.isEmpty()) {
				return res.status(400).json({ message: 'Invalid registration data' })
			}
			const { email, password } = req.body
			const person = await User.findOne({ email })
			if (person) {
				res.status(400).json({ message: 'User already exists' })
			}
			const username = getUsernameFromEmail(email)
			const encodedPassword = bcrypt.hashSync(password, 5)
			const currentDate = new Date()
			const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${(currentDate.getFullYear() % 100 + 5).toString().padStart(2, '0')}`

			const userRole = await Role.findOne({ role: 'USER' })

			const newUser = new User({ email, username, password: encodedPassword, roles: [userRole.role] })

			const newCard = new CardInfo({
				user_id: newUser.id,
				cardNumber: generateRandomValue('card'),
				cardHolderName: username,
				expirationDate: formattedDate,
				cvv: generateRandomValue('cvv')
			})

			await newCard.save()

			const transactions = new Transactions({
				user_id: newUser.id,
				transactions: []
			})

			await transactions.save()

			const statistic = new Statistic({ user_id: newUser.id })

			await statistic.save()

			newUser.cardInfo = newCard.id

			await newUser.save()

			return res.json({ message: 'New user was registered successfully' })
		} catch (error) {
			console.log(error)
		}
	}

	async login(req, res) {
		try {
			const { email, password } = req.body

			const user = await User.findOne({ email }).select('password username roles')
			if (!user) {
				res.status(400).json({ message: 'User is not found' })
			}

			const isValidPassword = bcrypt.compareSync(password, user.password)
			if (!isValidPassword) {
				res.status(400).json({ message: 'Password is not correct' })
			}

			const token = generateAccessToken(user._id, user.roles)

			return res.json({ token, username: user.username, user_id: user._id })
		} catch (error) {
			console.log(error)
		}
	}

	async getUsers(req, res) {
		const { search } = req.query

		const filter = {
			_id: { $ne: req.user.id },
			username: { $ne: 'admin' }
		}

		if (search) {
			filter.username = new RegExp(search, 'i')
		}

		try {
			const users = await User.find(filter).populate('cardInfo', 'cardNumber').exec()
			res.json(users)
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' })
		}
	}

	async me(req, res) {
		try {
			const user = await User.findOne({ _id: { $eq: req.user.id } })
			res.json(user)
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' })
		}
	}

	async myCard(req, res) {
		try {
			const cardInfo = await CardInfo.findOne({ user_id: { $eq: req.user.id } })
			res.json(cardInfo)
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' })
		}
	}

	async popUpMoney(req, res) {
		const amount = req.body.amount
		const { cardId } = req.params

		try {
			const card = await CardInfo.findById(cardId)

			if (!card) {
				res.status(404).json({ message: 'Card not found' })
			}

			card.balance += amount

			await card.save()

			const transactionData = {
				amount,
				type: 'pop-up'
			}

			await Transactions.findOneAndUpdate(
				{ user_id: req.user.id },
				{ $push: { transactions: transactionData } }
			)

			await Statistic.findOneAndUpdate(
				{ user_id: req.user.id },
				{ $inc: { 'statistic.income': amount } }
			)

			res.json({ message: 'Transaction passed successfully' })
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' })
		}
	}

	async withdrawMoney(req, res) {
		const amount = req.body.amount
		const { cardId } = req.params

		try {
			const card = await CardInfo.findById(cardId)

			if (!card) {
				res.status(404).json({ message: 'Card not found' })
			}

			card.balance -= amount

			await card.save()

			const transactionData = {
				amount,
				type: 'withdraw'
			}

			await Transactions.findOneAndUpdate(
				{ user_id: req.user.id },
				{ $push: { transactions: transactionData } }
			)

			await Statistic.findOneAndUpdate(
				{ user_id: req.user.id },
				{ $inc: { 'statistic.expense': amount } }
			)

			res.json({ message: 'Transaction passed successfully' })
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' })
		}
	}

	async transfer(req, res) {
		const amount = req.body.amount
		const cardNumber = req.body.cardNumber
		const { cardId } = req.params

		try {
			const myCard = await CardInfo.findById(cardId)
			const receiverCard = await CardInfo.findOne({ cardNumber })

			if (!myCard || !receiverCard) {
				res.status(404).json({ message: 'Card not found' })
			}

			myCard.balance -= amount
			receiverCard.balance += amount

			await myCard.save()
			await receiverCard.save()

			await Transactions.findOneAndUpdate(
				{ user_id: myCard.user_id },
				{ $push: { transactions: { type: 'withdraw', amount } } }
			)

			await Statistic.findOneAndUpdate(
				{ user_id: myCard.user_id },
				{ $inc: { 'statistic.expense': amount } }
			)

			await Transactions.findOneAndUpdate(
				{ user_id: receiverCard.user_id },
				{ $push: { transactions: { type: 'pop-up', amount } } }
			)

			await Statistic.findOneAndUpdate(
				{ user_id: receiverCard.user_id },
				{ $inc: { 'statistic.income': amount } }
			)

			res.json({ message: 'Transaction passed successfully' })
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' })
		}
	}

	async getTransactions(req, res) {
		const userId = req.user.id

		try {
			const transactions = await Transactions.findOne({ user_id: userId }).select('transactions')

			res.json(transactions)
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' })
		}
	}

	async getStatistic(req, res) {
		const userId = req.user.id

		try {
			const statistic = await Statistic.findOne({ user_id: userId }).select('statistic')

			res.json(statistic)
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' })
		}
	}
}

module.exports = new ServerController()