const bcrypt = require('bcrypt');
const User = require('../models/User');

/**
 * Add user for register user
 */
const addUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ 'message': 'Username and Password are required.' });
    }

    // check duplicate username
    const duplicateUser = await User.findOne({ username: username }).exec();
    if (duplicateUser) {
        return res.status(409).json({ 'message': 'User already exists.' });
    }
    try {
        // encrypt password
        const encryptPassword = await bcrypt.hash(password, 10);
        // new user
        const result = await User.create({
            'username': username,
            'password': encryptPassword
        });
        return res.status(201).json({ 'message': 'New user added.' });
    } catch (err) {
        return res.status(500).json({ 'message': err.message });
    }
}

const searchUsers = async (req, res) => {
    if (!req?.params?.username) {
        return res.status(400).json({ "message": 'Username is required' });
    }
    const search = req.params.username;
    const foundUsers = await User.find({ username: { $regex: `.*${search}.*`, $options: 'i' } }).exec();
    res.json(foundUsers);
}

module.exports = {
    addUser,
    searchUsers,
}