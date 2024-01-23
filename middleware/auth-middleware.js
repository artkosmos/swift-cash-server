const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  if (req.method === 'OPTIONS') {
    next()
  }

  try {
    const token = req.headers['authorization'].split(' ')[1]
    if (!token) {
      return res.status(403).json({message: 'User is not authorized'})
    }

    const decodedData = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN)
    if (decodedData) {
      req.user = decodedData
    }

    next()
  } catch (error) {
    return res.status(403).json({message: 'User is not authorized'})
  }
}