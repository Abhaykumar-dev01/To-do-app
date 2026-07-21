const jwt = require("jsonwebtoken");

const JWT_SECRET = "abhay123123key";

function authmiddleware(req, res, next) {
    const token = req.headers.token;

    if (!token) {
        return res.status(403).json({
            message: "No token provided"
        })
    }
    try {
        const decoded = jwt.verify(token, "abhay123123key");
        req.userId = decoded.userId;//attaching userId with the subsequent requests
        next();

    }
    catch (e) {
        res.status(403).json({
            message: "Token was incorrect"
        })
    }

}

module.exports = {
    authMiddleware: authMiddleware,
    JWT_SECRET
}