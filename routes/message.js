const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn } = require('../middleware');
const messagesController = require('../controllers/messages');

router.use(isLoggedIn);

router.get('/', wrapAsync(messagesController.getInbox));
router.get('/:conversationId', wrapAsync(messagesController.getConversation));
router.post('/:conversationId', wrapAsync(messagesController.sendMessage));

module.exports = router;
