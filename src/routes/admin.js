const path = require('path');

const express = require('express');

const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/user/get-all', adminController.getUsersList)

router.post('/user/new', adminController.createUser)

router.post('/board/create', adminController.createBoard)

router.get('/board/all', adminController.getAllBoards)

router.get('/board/:boardId/cards/all', adminController.getAllCardsFromBoard)

router.get('/cards/:cardId', adminController.getCardInfo);

router.post('/permission/grant', adminController.grantUserPermission)

router.post('/permission/board/grant', adminController.grantUserBoardPermission)

router.get('/cards/user/:userId/board/:boardId', adminController.getCardsFromUser)

router.get('/cards/user/:userId/card/:cardId', adminController.getUserCardView)

router.get('/cards/user/:userId/card/:cardId/list-permissions', adminController.getUserPermissionsInCard)

router.post('/account/code', adminController.createRegisterPermission)



module.exports = router