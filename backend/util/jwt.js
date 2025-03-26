const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("./secretKey");

async function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Received Token: ", token);

    if(!token){
        return res.status(403).json({message: "Forbidden Access!"});
    }
    
    const user = await decodeJWT(token);
    if(!user){
        return res.status(403).json({message: "Invalid Token!"});
    }

    req.user = user;
    next();
}

async function decodeJWT(token){
    const secretKey = await getJwtSecret();
    try{
        return jwt.verify(token, secretKey);
    }
    catch(err){
        console.error(err);
        return null;
    }
}

module.exports = authenticateToken;