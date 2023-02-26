const axios = require('axios');

module.exports = (sequelize, Sequelize) => {
	const Board = sequelize.define("board", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		boardName: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false
    },
		boardUrl: {
			allowNull: false,
			unique: true,
			type: Sequelize.STRING
		},
	});
	Board.getAllTrelloCards = async function (boardId) {
		let queryString = {
			key: process.env.TRELLOAPIKEY,
			token: process.env.TRELLOAPITOKEN,

		}
		const board = await Board.findAll({
			where:{
				id:boardId
			}
		})
		if(!board.length){
			return []
		}
		const boardUrl = board[0].boardUrl
		let cards = await axios.get('https://api.trello.com/1/boards/'+boardUrl+'/cards', {
			params: queryString
		})

		return cards
	}
	return Board
}

