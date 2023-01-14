const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(400).send({ statusCode: 400, success: false, msg: "Token is required for Authentication.", data: [] });
    }
    
    try {
        const decoded = jwt.verify(token, config.tokenKey);
        console.log("Token", decoded);
        req.user = decoded;
    } catch (err) {
        console.log(err.name);
        if(err.name === "TokenExpiredError") {
            console.log("Seems that token is expired adding new token");
            return res.status(500).send({ statusCode: 500, success: false, msg: "Token Expired.", data: [] });
        } else if(err.name === "JsonWebTokenError") {
            return res.status(500).send({ statusCode: 500, success: false, msg: "Token Malformed.", data: [] });
        } else {
            return res.status(500).send({ statusCode: 500, success: false, msg: "Error occurred while parsing token.", data: [] });
        }
    }
    return next();
};

module.exports = verifyToken;