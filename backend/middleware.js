const jwt = require("jsonwebtoken");

function authmiddleware(req, res, next) {
    const token = req.header.token;

    const decoded = jwt.verify(token, "abhay123123key");
    const userId = decoded.userId;
    if (userId) {
        req.userId = userId;
        next();

    }
    else {
        res.status(403).json({
            message: "Token was incorrect"
        })
    }

}

module.exports = {
    authMiddleware: authMiddleware
}