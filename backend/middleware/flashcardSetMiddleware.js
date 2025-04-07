const userService = require("../service/userService");
const { s3, BUCKET_NAME } = require("../util/awsClient");
const { ListObjectV2Command, ListObjectsCommand } = require("@aws-sdk/client-s3");

async function validateSetMiddleware(req, res, next){
    const userId = req.user.id;
    const targetSet = req.body.name;
    const prefix = `flashcards/${userId}/${targetSet}`

    // console.log("prefix: ", prefix);

    const command = new ListObjectsCommand({
        Bucket: BUCKET_NAME,
        Prefix: prefix
    })

    try{
        const result = await s3.send(command);
        if(result.Contents && result.Contents.length > 0){
            next();
        }
        else{
            return res.status(400).json({Message: "Set does not exist!"});
        }
    }
    catch(err){
        console.error(err);
        return res.status(400).json({Message: "Failed to find the target bucket!", err});
    }
}

module.exports = validateSetMiddleware