const Router = require('express')
const router = new Router()
const serverController = require('./server.controller')
const {check} = require('express-validator')
const authMiddleware = require('./middleware/auth-middleware')

router.post('/register', [
    check('email', 'Invalid email').notEmpty().isEmail(),
    check('password', 'Password is too short').isLength({min: 4, max: 10})
  ],
  serverController.registration)
router.post('/login', serverController.login)
router.get('/users', authMiddleware, serverController.getUsers)
router.get('/me', authMiddleware, serverController.me)
router.get('/my-card', authMiddleware, serverController.myCard)
router.patch('/my-card/:cardId/pop-up', authMiddleware, serverController.popUpMoney)
router.patch('/my-card/:cardId/withdraw', authMiddleware, serverController.withdrawMoney)
router.patch('/my-card/:cardId/transfer', authMiddleware, serverController.transfer)
router.get('/transactions', authMiddleware, serverController.getTransactions)
router.get('/statistic', authMiddleware, serverController.getStatistic)

module.exports = router