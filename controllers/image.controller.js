const tmp = require("tmp");
const fs = require("fs");
const db = require("../models");
const imageDb = db.image;

const returnError = (res, error, status = 500)=>{
    console.error(error);
    res.status(status).send({
        message: error
    });
}

exports.uploadPicture = (req, res)=>{
    if(!req.files){
        returnError(res, "No file is uploaded", 400);
    }
    else{
        const picture = Object.entries(req.files)[0][1];

        //File type validation
        if(picture.mimetype !== "image/jpeg" && picture.mimetype !== "image/png"){
            returnError(res, "Only PNG and JPG are supported", 400);
        }
        else{
            const image = {
                name: picture.name,
                source: picture.data.toString("base64")
            };

            imageDb.create(image).then(data =>{
                res.send({
                    name: data.name,
                    link: `${process.env.BACKEND_DOMAIN}/image/get-image-by-image-id/${data.imageId}`
                });
            }).catch(err =>{
                returnError(res, err);
            });
        }
    }
};

exports.getImageByImageId = (req, res)=>{
    imageDb.findByPk(req.params.imageId).then(data =>{
        if(data){
            const tmpPng = tmp.fileSync({postfix: '.png'});
            const base64 = new Buffer.from(data.source, "base64");
            fs.writeFileSync(tmpPng.name, base64);
            res.sendFile(tmpPng.name);
        }
        else{
            returnError(res, `Failed to get image by ImageId=${req.params.imageId}`, 400);
        }
    }).catch(err =>{
        returnError(res, err);
    });
};
