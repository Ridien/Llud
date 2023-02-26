const dbConfig = require('../db.config.js')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host:dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases:false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  dialectOptions: {
    ssl: true
  }
})
const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require("./user.model.js")(sequelize, Sequelize);
db.boards = require("./board.model.js")(sequelize, Sequelize); 
db.cards = require("./card.model.js")(sequelize, Sequelize);
db.register = require("./register.model.js")(sequelize, Sequelize);
db.permission = require("./permission.model.js")(sequelize, Sequelize);
db.permissionUserCard = require("./permission-user-card.model.js")(sequelize, Sequelize);
db.userboards = require("./user-board.js")(sequelize, Sequelize);
db.userboards.hasOne(db.boards, { sourceKey: 'boardId', foreignKey: 'id', foreignKeyConstraint: true })
db.permissionUserCard.hasOne(db.cards, { sourceKey: 'cardId', foreignKey: 'id', foreignKeyConstraint: true })
db.permissionUserCard.hasOne(db.users, { sourceKey: 'userId', foreignKey: 'id', foreignKeyConstraint: true })
db.permissionUserCard.hasOne(db.permission, { sourceKey: 'permissionId', foreignKey: 'id', foreignKeyConstraint: true })
module.exports = db