const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Login
 */
const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ 'message': 'Username or password is missing.' });
    }

    const loginUser = await User.findOne({ username: username }).exec();
    if (!loginUser) {
        return res.sendStatus(401);
    }
    // evaluate password 
    const match = await bcrypt.compare(password, loginUser.password);
    if (match) {
        // create access token
        const accessToken = jwt.sign(
            { "username": loginUser.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '3h' }
        );
        // create refresh token
        const refreshToken = jwt.sign(
            { "username": loginUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // saving refreshToken to login user
        loginUser.refreshToken = refreshToken;
        await loginUser.save();

        // creates http only cookie using refresh token
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        // send access token to user
        res.json({ accessToken });

    } else {
        res.sendStatus(401);
    }
}

/**
 * Logout
 */
const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    // cookie 'jwt' not exists
    if (!cookies?.jwt) {
        return res.sendStatus(204);
    }
    const refreshToken = cookies.jwt;

    // check refresh token in db
    const loginUser = await User.findOne({ refreshToken }).exec();
    if (!loginUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // remove refreshToken in db
    loginUser.refreshToken = '';
    await loginUser.save();

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

/**
 * Refresh Token
 */
const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    // cookie 'jwt' not exists
    if (!cookies?.jwt) {
        return res.sendStatus(401);
    }
    const refreshToken = cookies.jwt;
    const loginUser = await User.findOne({ refreshToken }).exec();
    // user not found
    if (!loginUser) {
        return res.sendStatus(403);
    }
    // verify jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            // compare user info
            if (err || loginUser.username !== decoded.username) {
                return res.sendStatus(403);
            }
            // create new access token
            const accessToken = jwt.sign(
                { "username": decoded.username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '3h' }
            );
            res.json({ accessToken });
        }
    );
}

module.exports = {
    handleLogin,
    handleLogout,
    handleRefreshToken
};