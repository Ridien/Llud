module.exports = (sequelize, Sequelize) => {
    const Permission = sequelize.define("permission", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull:false,
        autoIncrement: true
      },
      type: {
        allowNull:false,
        unique: true,
        type: Sequelize.STRING
      }
    });
  
    return Permission
  }