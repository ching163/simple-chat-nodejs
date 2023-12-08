const Message = require('../models/Message');

/**
 * Send / Save message using provided data 
 */
const sendMessage = async (req, res) => {
    const { fromUser, toUser, content } = req.body;
    if (!fromUser || !toUser || !content) {
        return res.status(400).json({ 'message': 'Required message data missing.' });
    }

    try {
        const result = Message.create({
            "fromUser": fromUser,
            "toUser": toUser,
            "content": content
        });
        return res.status(201).json({ 'message': 'Message sent' });
    } catch (err) {
        return res.status(500).json({ 'message': err.message });
    }
}

/**
 * Get user contact list
 * Params:
 *  currUser: user to get contact list from.
 */
const getContacts = async (req, res) => {
    if (!req?.params?.currUser) {
        return res.status(400).json({ "message": 'Username is required' });
    }
    const user = req.params.currUser;
    try {
        const data = await Message.aggregate([
            {
                $match: {
                    fromUser: user
                }
            },
            { $project: { contact: '$toUser', createdAt: 1 } },
            {
                $unionWith: {
                    coll: "messages",
                    pipeline: [{
                        $match: {
                            toUser: user
                        },
                    },
                    { $project: { contact: '$fromUser', createdAt: 1 } }]
                }
            },
            { $sort: { 'createdAt': -1 } },
            {
                $group: {
                    _id: { contact: '$contact' },
                    contact: { $first: '$contact' },
                    lastMsgAt: { $first: '$createdAt' }
                }
            },
            { $sort: { 'lastMsgAt': -1 } },
        ]).exec();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ 'message': err.message });
    }
}

/**
 * Get all messages between two users
 * Params:
 *  currUser: user 1 username
 *  contactUser: user 2 username
 */
const getMessages = async (req, res) => {
    if (!req?.params?.currUser || !req?.params?.contactUser) {
        return res.status(400).json({ "message": 'Username is required' });
    }
    const currUser = req.params.currUser;
    const contactUser = req.params.contactUser;
    try {
        const data = await Message.find(
            {
                $or: [
                    { fromUser: currUser, toUser: contactUser },
                    { fromUser: contactUser, toUser: currUser }]
            })
            .sort({ createdAt: 1 }).exec();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ 'message': err.message });
    }
}

module.exports = {
    sendMessage,
    getContacts,
    getMessages
}