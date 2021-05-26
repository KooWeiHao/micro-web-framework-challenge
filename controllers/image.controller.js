const tmp = require("tmp");
const fs = require("fs");
const extractZip = require('extract-zip');
const mimeTypes = require('mime-types');

const db = require("../models");
const imageDb = db.image;

const returnError = (res, error, status = 500)=>{
    console.error(error);
    res.status(status).send({
        message: error
    });
}

const isValidImage = (mimeType)=>{
    return ["image/jpeg", "image/png"].includes(mimeType);
};

const isValidZipFile = (mimeType)=>{
    return mimeType === "application/zip";
};

exports.uploadPicture = (req, res)=>{
    if(!req.files){
        returnError(res, "No file is uploaded", 400);
    }
    else{
        const picture = Object.entries(req.files)[0][1];

        if(!isValidImage(picture.mimetype)){
            returnError(res, "Only PNG and JPG are supported", 400);
        }
        else{
            const image = {
                name: picture.name,
                source: picture.data.toString("base64") //store image base64 string
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
            //store image to a temp file and return the file
            const tmpPng = tmp.fileSync({postfix: '.png'});
            const tmpPngPath = tmpPng.name;
            const base64 = new Buffer.from(data.source, "base64");
            fs.writeFileSync(tmpPngPath, base64);
            res.sendFile(tmpPngPath);
        }
        else{
            returnError(res, `Failed to get image by ImageId=${req.params.imageId}`, 400);
        }
    }).catch(err =>{
        returnError(res, err);
    });
};

exports.uploadPicturesInZip = (req, res)=>{
    if(!req.files){
        returnError(res, "No file is uploaded", 400);
    }
    else{
        const zip = Object.entries(req.files)[0][1];

        if(!isValidZipFile(zip.mimetype)){
            returnError(res, "Only ZIP file is supported", 400);
        }
        else{
            //store uploaded zip file to a temp folder
            const tmpDir = tmp.dirSync();
            const tmpDirPath = tmpDir.name;
            const tmpZip = tmp.fileSync({postfix: '.zip'});
            const tmpZipPath = tmpZip.name;
            fs.writeFileSync(tmpZipPath, zip.data);

            extractZip(tmpZipPath, {dir: tmpDirPath}).then(async ()=>{
                const datas = [];
                const pictures = fs.readdirSync(tmpDirPath);
                for (let picture of pictures) {
                    const absolutePath = `${tmpDir.name}\\${picture}`;
                    const pushData = (imageId, error) =>{
                        datas.push({
                            name: picture,
                            link: imageId ? `${process.env.BACKEND_DOMAIN}/image/get-image-by-image-id/${imageId}` : null,
                            message: error ? `Failed. ${error}` : "Success"
                        });
                    };
                    const mimeType = mimeTypes.lookup(absolutePath);

                    if(!isValidImage(mimeType)){
                        pushData(null, "Only PNG and JPG are supported");
                    }
                    else{
                        const blob = fs.readFileSync(absolutePath);
                        const image = {
                            name: picture,
                            source: new Buffer.from(blob).toString('base64')
                        };

                        try{
                            const data = await imageDb.create(image);
                            pushData(data.imageId, null);
                        }
                        catch (err){
                            pushData(null, err);
                        }
                    }
                }

                res.send(datas);
            }).catch(err =>{
                returnError(res, err);
            });
        }
    }
};
