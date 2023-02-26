const axios = require('axios');
const db = require('../models')
const Board = db.boards

module.exports = (sequelize, Sequelize) => {
	const Card = sequelize.define("card", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		cardBoardId:{
			allowNull: false,
			type: Sequelize.INTEGER,
			references:{
                model: 'boards',
                key: 'id' 
            }
		},
		cardUrl: {
			allowNull: false,
			unique: true,
			type: Sequelize.STRING
		},
		cardCoverUrl: {
			allowNull: true,
			type: Sequelize.STRING
		}
	});
	Card.createCard = async function ({cardUrl, board}){
		let queryString = {
			key: process.env.TRELLOAPIKEY,
			token: process.env.TRELLOAPITOKEN,
		}
		try {
			let boardData = await axios.get('https://api.trello.com/1/cards/' + cardUrl + '/board', {
				params: queryString
			})
			const boardQuery = await board.findAll({
				where:{
					boardUrl: boardData.data.shortLink
				}
			})
			if(!boardQuery.length){
				return null
			}
			const {card_data} = await Card.findByUrl(cardUrl)
			let cover = null
			if(card_data.cover && card_data.cover.scaled){
				cover = card_data.cover.scaled.slice(-1)[0].url
			}
			return Card.create({
				cardBoardId:boardQuery[0].id,
				cardUrl:cardUrl,
				cardCoverUrl:cover
			})
		} catch (error) {
			return null
		}
		console.log()

	}
	Card.findByUrl = async function (cardUrl) {
		let queryString = {
			key: process.env.TRELLOAPIKEY,
			token: process.env.TRELLOAPITOKEN,
		}
		try {
			let card = await axios.get('https://api.trello.com/1/cards/' + cardUrl, {
				params: queryString
			})
			let attachments = await axios.get('https://api.trello.com/1/cards/' + cardUrl + '/attachments', {
				params: queryString
			})
			const cardTitles = card.data.desc.match(/(?<=\*{2})(.+)(?=\:\*{2})/g)
			const cardDescriptions = card.data.desc.match(/(?<=\:\*{2})((.|\n)[^\*]*)/g)
			let card_object = {}
			if (cardTitles && cardTitles.length > 0) {
				cardTitles.forEach((element, idx) => {
					card_object[element] = cardDescriptions[idx]
				});
			}
			return {
				card_data: card.data,
				card_object: card_object,
				attachment_data: attachments.data
			}
		} catch (error) {
			return null
		}

	}
	return Card
}

