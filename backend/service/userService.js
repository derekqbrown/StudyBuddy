const userDAO = require("../repository/userDAO");
const bcrypt = require("bcrypt");

async function getUser(username){
    const result = await userDAO.getUser(username);

    if(!result){
        return null;
    }

    return result;
}

module.exports = { getUser };