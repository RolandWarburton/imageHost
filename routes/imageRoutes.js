const express = require("express");
const router = express.Router();
const ImageController = require("../controllers/images");

router.get("/image/:id", ImageController.getImage);
router.get("/images", ImageController.getImages);
router.post("/image", ImageController.postImage);

module.exports = router;
