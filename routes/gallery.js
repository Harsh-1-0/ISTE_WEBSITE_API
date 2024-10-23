import express from "express";
import upload from "../config/multerconfig.js";
import Gallery from "../models/gallery.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";
const routerGallery = express.Router();

routerGallery.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const galleryData = await Gallery.find().skip(skip).limit(limit);

    return res.status(200).send(galleryData);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

routerGallery.post(
  "/",
  checkRole([1, 2, 3]),
  upload.array("galleryimage"),
  async (req, res) => {
    try {
      const uploadPromises = req.file.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              format: "webp",
            },
            async (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result.secure_url);
            }
          );
          stream.end(file.stream);
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }
);

export default routerGallery;
