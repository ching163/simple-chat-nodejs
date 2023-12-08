const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authStr = req.headers.authorization || req.headers.Authorization;
    if (!authStr?.startsWith('Bearer ')) {
        return res.sendStatus(401);
    }
    const token = authStr.split(' ')[1];
    // verify token
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403);
            req.user = decoded.username;
            next();
        }
    );
}

module.exports = verifyJWT