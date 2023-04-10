module.exports = (sequelize, Sequelize) => {
    const UserBoard = sequelize.define("userboard", {
        userId : {
            type: Sequelize.INTEGER,
            allowNull:false,
            primaryKey: true,
            references:{
                model: 'users',
                key: 'id' 
            }
        },
        boardId : {
            type: Sequelize.INTEGER,
            allowNull:false,
            primaryKey: true,
            references:{
                model: 'boards',
                key: 'id' 
            }
        }
    });
    return UserBoard
  }