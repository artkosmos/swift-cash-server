const getUsernameFromEmail = (email) => {
  const endIndex = email.indexOf('@')

  return email.substring(0, endIndex)
}

module.exports = getUsernameFromEmail