
const bcrypt = require("bcrypt-nodejs");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    password: {
      allowNull: false,
      type: Sequelize.STRING
    },
    nickname: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING
    },
    isAdmin:{
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
  });
  User.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  }
  User.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  }
  return User

}
