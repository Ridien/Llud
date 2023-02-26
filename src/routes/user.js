const path = require('path');

const express = require('express');

const userController = require('../controllers/userController');

const router = express.Router();

router.get('/boards', userController.getUserBoards)
router.get('/board/:boardId/cards', userController.getUserCardsInBoard)
router.get('/card/:cardId', userController.getCardInfo)


module.exports = router