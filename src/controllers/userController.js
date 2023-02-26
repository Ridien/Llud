const db = require('../models')
const User = db.users
const Card = db.cards
const UserBoard = db.userboards
const Board = db.boards
const Permission = db.permission
const PermissionUserCard = db.permissionUserCard
const Sequelize = require('sequelize')

exports.getUserBoards = async (req, res, next) => {
    if(!req.user.userId){
        return res.status(422).send('User not found')
    }
    const userBoards = await UserBoard.findAll({
        where:{
            userId:req.user.userId
        },
        attributes:[[Sequelize.col('board.boardName'), 'boardName'], [Sequelize.col('board.id'), 'id']],
        include:[{
            model:Board,
            attributes: [],
            required:true
        }],
        raw: true
    })
    return res.status(200).json(userBoards)

}

exports.getCardInfo = async (req, res, next) => {
    const cardId = req.params.cardId
    const userId = req.user.userId
    const cardQuery = await Card.findAll(
        {
            where: {
                cardUrl:cardId
            }
        }
    )

    if(!cardQuery.length){
        return res.status(422).send('Card not found')
    }
    const currentCard = cardQuery[0]
    const userPermissions = await PermissionUserCard.findAll({
        where:{
            userId:Number(userId),
            cardId:currentCard.dataValues.id
        },
        include:[{
            model:Permission,
            required:true
        }]
    })
    let userPermissionsInCard = userPermissions.map(e=>e.dataValues.permission.dataValues.type)
    if(!userPermissionsInCard.length || !userPermissionsInCard.includes('view')){
        return res.status(401).send('Unauthorized action')
    }
    const {card_data, card_object} = await Card.findByUrl(cardId)
    let resp = {
        name:card_data.name,
        id:card_data.id,
        card_object:{},
        cover:null
    }
    if(userPermissionsInCard.includes('cover') && card_data.cover && card_data.cover.scaled){
        resp.cover = card_data.cover
    }
    if(Object.keys(card_object).length === 0){
        return res.status(200).json(resp)
    }
    for (const item of Object.keys(card_object)) {
        if(userPermissionsInCard.includes(item)){
            resp.card_object[item] = card_object[item]
        }
    }

    return res.status(200).json(resp)
}

exports.getUserCardsInBoard = async (req, res, next) => {
    const userId = req.user.userId
    const boardId = req.params.boardId
    const permissionQuery = await Permission.findAll({
        where:{
            type:'view'
        }
    })
    const coverPermissionQuery = await Permission.findAll({
        where:{
            type:'cover'
        }
    })
    let permission = permissionQuery[0]
    let coverPermission = coverPermissionQuery[0]
    const userCards = await PermissionUserCard.findAll({
        where:{
            userId:userId,
            permissionId:permission.dataValues.id
        },
        include:[{
            model:Card,
            required:true,
            where:{
                cardBoardId:boardId
            }
        }]
    })
    const coverCards = await PermissionUserCard.findAll({
        where:{
            userId:Number(userId),
            permissionId:coverPermission.dataValues.id
        },
        include:[{
            model:Card,
            required:true,
            where:{
                cardBoardId:boardId
            }
        }]
    })
    let coverList = {}
    for(const item of coverCards){
        coverList[item.card.cardUrl]= item.card.cardCoverUrl || null
    }
    const { data:trelloCards } = await Board.getAllTrelloCards(boardId)
    let cardsList = userCards.map(e=>e.dataValues.card.dataValues.cardUrl)
    const resp = trelloCards.filter(card =>cardsList.includes(card.id)).map(card=>{
        return {
            id:card.id,
            name:card.name,
            cover: coverList[card.id]
        }
    })
    res.status(200).json(resp)

}