const userDAO = require("../repository/userDAO");
const bcrypt = require("bcrypt");
const logger = require("../util/logger");

const saltNumber = 10;

async function getUser(username){
    logger.info(`Fetching user with username: ${username}`);
    const result = await userDAO.getUser(username);

    if(!result){
        logger.warn(`User not found: ${username}`);
        return null;
    }

    return result;
}

async function createUser(username, password) {
    logger.info(`Creating user: ${username}`);
    const hashedPassword = await bcrypt.hash(password, saltNumber);

    try {
        const result = await userDAO.createUser(username, hashedPassword);
        logger.info(`User created successfully: ${username}`);
        return result;
    } catch (err) {
        logger.error(`Error creating user ${username}: ${err.message}`);
        throw err;
    }
}

async function updateUser(userId, username, password){
    logger.info(`Updating user with ID: ${userId}`);
    const hashedPassword = await bcrypt.hash(password, saltNumber);
    const result = await userDAO.updateUser(userId, username, hashedPassword);

    logger.info(`User with ID ${userId} updated successfully`);
    return result;
}

async function deleteUser(userId) {
    logger.info(`Deleting user with ID: ${userId}`);
    try {
        const result = await userDAO.deleteUser(userId);
        logger.info(`User with ID ${userId} deleted`);
        return result;
    } catch (err) {
        logger.error(`Error deleting user ${userId}: ${err.message}`);
        throw err;
    }
}

async function updateUserProfilePicture(userId, fileKey) {
    logger.info(`Updating profile picture for user ${userId}`);
    return await userDAO.updateUserProfilePicture(userId, fileKey);
}

async function uploadUserProfilePictureToS3(userId, fileBuffer, fileType) {
    logger.info(`Uploading profile picture to S3 for user ${userId}`);
    return await userDAO.uploadProfilePictureToS3(userId, fileBuffer, fileType);
}

async function getProfilePicture(fileKey) {
    logger.info(`Fetching profile picture with key: ${fileKey}`);
    return await userDAO.getProfilePictureFromS3(fileKey);
}

async function createSet(userName, newSet){
    logger.info(`Creating new flashcard set '${newSet}' for user ${userName}`);
    const result = await userDAO.createSet(userName, newSet);

    if(!result){
        logger.warn(`Failed to create set '${newSet}' for user ${userName}`);
        return false;
    }

    logger.info(`Flashcard set '${newSet}' created for user ${userName}`);
    return result;
}

module.exports = { getUser, createUser, updateUser, deleteUser, getProfilePicture, updateUserProfilePicture,
    uploadUserProfilePictureToS3, createSet };
