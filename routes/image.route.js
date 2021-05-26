module.exports = app =>{
    const imageController = require("../controllers/image.controller.js");
    const router = require("express").Router();

    router.post("/upload-picture", imageController.uploadPicture);
    router.get("/get-image-by-image-id/:imageId", imageController.getImageByImageId);

    router.post("/upload-pictures-in-zip", imageController.uploadPicturesInZip);

    app.use('/image', router);
};
