module.exports = app =>{
    const imageController = require("../controllers/image.controller.js");
    const router = require("express").Router();

    router.post("/upload-picture", imageController.uploadPicture);
    router.get("/get-image-by-image-id/:imageId", imageController.getImageByImageId);

    app.use('/image', router);
};
