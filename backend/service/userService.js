const userDAO = require("../repository/userDAO");
const bcrypt = require("bcrypt");

async function getUser(username){
    const result = await userDAO.getUser(username);

    if(!result){
        return null;
    }

    return result;
}

async function createUser(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await userDAO.createUser(username, hashedPassword);
}

module.exports = { getUser, createUser };