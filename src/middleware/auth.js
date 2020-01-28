const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (request, response, next)=> {

    try {
        const token = request.header("Authorization").split(" ")[1];
        const verifiedToken = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({_id: verifiedToken.id, 'tokens.token': token});

        if(!user) {
            throw new Error("");
        }
        request.token = token;
        request.user = user;
        next();
    } catch (err) {
        response.status(401).send("Please authenticate");
    }
};

module.exports = auth;
