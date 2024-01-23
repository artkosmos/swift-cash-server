const jwt = require('jsonwebtoken')

const generateAccessToken = (id, roles) => {
  const payload = {id, roles}

  return jwt.sign(payload, process.env.ACCESS_SECRET_TOKEN)
}

module.exports = generateAccessToken