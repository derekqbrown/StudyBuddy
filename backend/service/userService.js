const userDAO = require("../repository/userDAO");
const bcrypt = require("bcrypt");

const saltNumber = 10;

async function getUser(username){
    const result = await userDAO.getUser(username);

    if(!result){
        return null;
    }

    return result;
}

async function createUser(username, password) {

    const hashedPassword = await bcrypt.hash(password, saltNumber);
    return await userDAO.createUser(username, hashedPassword);
}

async function updateUser(userId, username, password){

    const hashedPassword = await bcrypt.hash(password, saltNumber);
    const result = await userDAO.updateUser(userId, username, hashedPassword);

    if(!result){
        return null;
    }

    return result;
}

async function deleteUser(user_id) {
    return await userDAO.deleteUser(user_id);
}

module.exports = { getUser, createUser, updateUser, deleteUser};

