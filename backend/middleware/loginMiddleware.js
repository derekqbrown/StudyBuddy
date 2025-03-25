const bcrypt = require("bcrypt");
const userService = require("../service/userService");

async function validateLoginMiddleware(req, res, next){
    const jsonBody = req.body;

    const isValidLogin = await validateLogin(jsonBody);
    console.log("validateLogin result:", isValidLogin);

    if (!isValidLogin) {
        return res.status(400).json({
            message: "Invalid username or password!"
        });
    }

    const isUsernameValid = await validateUsername(jsonBody);
    if(!isUsernameValid){
        return res.status(400).json({
            message: "Username does not exist"
        });
    }

    const isPasswordCorrect = await validatePassword(jsonBody);
    if(!isPasswordCorrect){
        return res.status(400).json({
            message: "Incorrect password!"
        });
    }

    next();
}

async function validateLogin(data){
    return (data.username && data.password)
}

async function validateUsername(data){
    const user = await userService.getUser(data.username);

    if(!user){
        return false;
    }
    
    return true;
}

async function validatePassword(data){
    const user = await userService.getUser(data.username);

    if(user && (await bcrypt.compare(data.password, user.password))){
        return true;
    }
    else{
        return false;
    }
}

module.exports = validateLoginMiddleware;