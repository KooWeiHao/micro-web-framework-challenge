const tmp = require("tmp");
const fs = require("fs");
const extractZip = require('extract-zip');
const mimeTypes = require('mime-types');
const imageSize = require('image-size');
const sharp = require('sharp');

const db = require("../models");
const imageDb = db.image;

const returnErrorResponse = (res, error, status = 500)=>{
    console.error(error);
    res.status(status).send({
        message: error
    });
}
const generateUploadResponse = (dataList, data)=>{
    dataList.push({
        name: data.name,
        width: data.width,
        height: data.height,
        link: data.imageId ? `${process.env.BACKEND_DOMAIN}/image/get-image-by-image-id/${data.imageId}` : null,
        message: data.error ? `Failed. ${data.error}` : "Success"
    });

    return dataList;
};


const generateThumbnail = async (picture)=>{
    const thumbnails = [];
    const maximumArea = 128 * 128;

    const buffer = picture.data;
    const dimension = imageSize(buffer);
    const width = dimension.width;
    const height = dimension.height;
    const area = width * height;

    const resize = async (newWidth)=>{
        const newHeight = Math.round((newWidth/width) * height);
        const newBuffer = await sharp(buffer).resize(newWidth, newHeight).toBuffer();
        return {
            name: picture.name,
            source: newBuffer.toString("base64"),
            width: newWidth,
            height: newHeight
        }
    };

    //generate two thumbnails with width 32 and 64 respectively if exceed maximumArea, else use original image as thumbnail
    if(area > maximumArea){
        const newThumbnails = [await resize(32), await resize(64)];
        newThumbnails.forEach(t =>{
            thumbnails.push(t);
        });
    }
    else{
        thumbnails.push({
            name: picture.name,
            source: buffer.toString("base64"),
            width: width,
            height: height
        });
    }

    return thumbnails;
};

const extractUploadedZip = async (zip)=>{
    //store uploaded zip file to a temp folder
    const tmpDir = tmp.dirSync();
    const tmpDirPath = tmpDir.name;
    const tmpZip = tmp.fileSync({postfix: '.zip'});
    const tmpZipPath = tmpZip.name;
    fs.writeFileSync(tmpZipPath, zip.data);

    //extract all files in zip to a temp folder
    await extractZip(tmpZipPath, {dir: tmpDirPath});

    //read all files from temp folder
    const files = fs.readdirSync(tmpDirPath);
    return files.map(file =>{
        return {
            name: file,
            path: `${tmpDirPath}\\${file}`
        }
    });
};

const uploadZip = async (zip) =>{
    let datas = [];
    const pictures = await extractUploadedZip(zip);

    for (let picture of pictures){
        const data = {
            name: picture.name,
            width: null,
            height: null,
            imageId: null,
            error: null
        };

        //image validation
        const mimeType = mimeTypes.lookup(picture.path);
        if(!["image/jpeg","image/png"].includes(mimeType)){
            data.error = "Only PNG and JPG are supported";
            generateUploadResponse(datas, data);
        }
        else{
            const blob = fs.readFileSync(picture.path);
            const images = await uploadImage({
                name: picture.name,
                data: new Buffer.from(blob)
            });
            datas = [...datas, ...images];
        }
    }

    return datas;
};

const uploadImage = async (picture) =>{
    const datas = [];
    const images = await generateThumbnail(picture);

    for(let image of images){
        const data = {
            name: image.name,
            width: image.width,
            height: image.height,
            imageId: null,
            error: null
        };

        try{
            const result = await imageDb.create(image);
            data.imageId = result.imageId;
            generateUploadResponse(datas, data);
        }
        catch (err){
            console.error(err);
            data.error = err;
            generateUploadResponse(datas, data);
        }
    }

    return datas;
}

exports.upload = (req, res)=>{
    if(!req.files){
        returnErrorResponse(res, "No file is uploaded", 400);
    }
    else{
        const file = Object.entries(req.files)[0][1];

        switch (file.mimetype){
            case "image/jpeg": case "image/png":
                uploadImage(file).then(data =>{
                    res.send(data);
                }).catch(err =>{
                    returnErrorResponse(res, err);
                });
                break;

            case "application/zip":
                uploadZip(file, res).then(data =>{
                    res.send(data);
                }).catch(err =>{
                    returnErrorResponse(res, err);
                });
                break;

            default:
                returnErrorResponse(res, "Only PNG, JPG and ZIP are supported", 400);
                break;
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
            returnErrorResponse(res, `Failed to get image by ImageId=${req.params.imageId}`, 400);
        }
    }).catch(err =>{
        returnErrorResponse(res, err);
    });
};
