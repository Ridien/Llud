const db = require('../models')
const User = db.users
const Card = db.cards
const Board = db.boards
const Register = db.register
const UserBoard = db.userboards
const Permission = db.permission
const PermissionUserCard = db.permissionUserCard

exports.getUsersList = async (req, res, next) => {
    const data = await User.findAll({
        attributes: ['id', 'nickname']
    })
    res.json(data)
};

exports.createUser = async (req, res, next) => {
    const nickname = req.body.nickname
    const password = User.generateHash(req.body.password)
    try {
        await User.create({
            password: password,
            nickname: nickname
        })
        res.status(201).json({ message: "Successfully Registered" })

    } catch (error) {
        res.status(500).send({
            message:
                error.message || "Some error occurred while creating the User."
        });
    }
}

exports.createRegisterPermission = async (req, res, next) => {
    const code = req.body.code
    try {
        await Register.create({
            permission_code:code
        })
        res.status(201).json({ message: "Successfully Registered" })
    } catch (error) {
        res.status(500).send({
            message:
                error.message || "Some error occurred while creating the User."
        });
    }
}


exports.getCardInfo = async (req, res, next) => {
    const cardId = req.params.cardId
    const data = await Card.findByUrl(cardId)
    if(!data){
        return res.status(404).json("Card not found")
    }
    res.status(200).json(data)
}

exports.getAllBoards = async (req, res, next) => {
    const boards = await Board.findAll()
    res.json(boards)
}
exports.getAllCardsFromBoard = async (req, res, next) => {
    const boardId = req.params.boardId
    const { data } = await Board.getAllTrelloCards(boardId)
    res.status(200).json(data)
}
exports.createBoard = async (req, res, next) => {
    const name = req.body.boardName
    const url = req.body.boardUrl
    try {
        await Board.create({
            boardName: name,
            boardUrl: url
        })
        res.status(201).json({ message: "Successfully Registered" })

    } catch (error) {
        res.status(500).send({
            message:
                error.message || "Some error occurred while creating the User."
        });
    }
}

exports.grantUserBoardPermission = async (req, res, next) => {
    const board = req.body.boardId
    const user = req.body.userId
    try {
        await UserBoard.create({
            userId:user,
            boardId:board
        })
        res.status(201).json({ message: "Successfully Registered" })
    } catch (error) {
        res.status(422).json({ message: "Ocorreu um erro!" })
    }

}

exports.grantUserPermission = async (req, res, next) => {
    const cardUrl = req.body.cardUrl
    const permissionType = req.body.permissionType
    const user = req.body.userId
    let permission = null
    let card = null

    const userQuery = await User.findAll({
        where:{
            id:user
        }
    })
    if(!userQuery.length){
        return res.status(422).send('User not found')
    }

    const permissionQuery = await Permission.findAll({
        where: {
            type:permissionType
        }
    })
    if(!permissionQuery.length){
        permission = await Permission.create({ type: permissionType});
    }else{
        permission = permissionQuery[0]
    }

    const cardQuery = await Card.findAll(
        {
            where: {
                cardUrl:cardUrl
            }
        }
    )
    if(!cardQuery.length){
        card = await Card.createCard({ cardUrl: cardUrl, board: Board});
        if(!card){
            return res.status(422).json('Erro ao cadastrar permissão')
        }
    }else{
        card = cardQuery[0]
    }
    try {
        await PermissionUserCard.create({
            userId:user,
            cardId:card.dataValues.id,
            permissionId:permission.dataValues.id
        })
    
    } catch (error) {
        return res.status(422).json('Erro ao cadastrar permissão')
    }
    res.status(200).json('OK!')
}

exports.getCardsFromUser = async (req, res, next) => {
    const userId = req.params.userId
    const boardId = req.params.boardId

    const userQuery = await User.findAll({
        where:{
            id:userId
        }
    })
    if(!userQuery.length){
        return res.status(422).send('User not found')
    }
    const permissionQuery = await Permission.findAll({
        where:{
            type:'view'
        }
    })
    let permission = permissionQuery[0]
    const userCards = await PermissionUserCard.findAll({
        where:{
            userId:Number(userId),
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
    const { data:trelloCards } = await Board.getAllTrelloCards(boardId)
    let cardsList = userCards.map(e=>e.dataValues.card.dataValues.cardUrl)
    const resp = trelloCards.filter(card =>cardsList.includes(card.id)).map(card=>{
        return {
            id:card.id,
            name:card.name,
        }
    })
    res.status(200).json(resp)
}

exports.getUserCardView = async (req, res, next) => {
    const userId = req.params.userId
    const cardId = req.params.cardId
    const userQuery = await User.findAll({
        where:{
            id:userId
        }
    })

    if(!userQuery.length){
        return res.status(422).send('User not found')
    }

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

exports.getUserPermissionsInCard = async (req, res, next) => {
    const userId = req.params.userId
    const cardId = req.params.cardId
    const userQuery = await User.findAll({
        where:{
            id:userId
        }
    })

    if(!userQuery.length){
        return res.status(422).send('User not found')
    }

    const cardQuery = await Card.findAll(
        {
            where: {
                cardUrl:cardId
            }
        }
    )
    if(!cardQuery.length){
        return res.status(200).json([])
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
    if(!userPermissionsInCard.length){
        return res.status(200).json([])
    }

    return res.status(200).json(userPermissionsInCard)
}