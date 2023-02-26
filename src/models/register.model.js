const axios = require('axios');

module.exports = (sequelize, Sequelize) => {
	const Register = sequelize.define("register", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		permission_code: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true
		}
	});
	return Register
}

