const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/messageController');

router.route('/')
    .post(messageController.sendMessage);

router.route('/:currUser&:contactUser')
    .get(messageController.getMessages);

router.route('/contacts/:currUser')
    .get(messageController.getContacts);

module.exports = router;