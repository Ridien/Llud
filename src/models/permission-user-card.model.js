const db = require('../models')


module.exports = (sequelize, Sequelize) => {
    const PermissionUserCard = sequelize.define("permissionusercards", {
        userId : {
            type: Sequelize.INTEGER,
            allowNull:false,
            primaryKey: true,
            references:{
                model: 'users',
                key: 'id' 
            }
        },
        cardId : {
            type: Sequelize.INTEGER,
            allowNull:false,
            primaryKey: true,
            references:{
                model: 'cards',
                key: 'id' 
            }
        },
        permissionId : {
            type: Sequelize.INTEGER,
            allowNull:false,
            primaryKey: true,
            references:{
                model: 'permissions',
                key: 'id' 
            }
        },
    });
    return PermissionUserCard
  }