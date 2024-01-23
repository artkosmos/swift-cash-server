/**
 *
 * @param {'cvv' | 'card'} type
 * @returns {string}
 */
function generateRandomValue(type) {
	const generateRandomCardNumber = () => {
		let cardNumber = '';
		for (let i = 0; i < 16; i++) {
			cardNumber += Math.floor(Math.random() * 10);
		}
		return cardNumber;
	};

	const generateRandomCVV = () => {
		return Math.floor(100 + Math.random() * 900).toString();
	};

	if (type === 'card') {
		return generateRandomCardNumber();
	} else if (type === 'cvv') {
		return generateRandomCVV();
	} else {
		throw new Error('Invalid type. Supported types are "card" and "cvv".');
	}
}

module.exports = generateRandomValue