import express from "express";
import upload from "../config/multerconfig.js";
import Gallery from "../models/gallery.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";
const routerGallery = express.Router();

routerGallery.get("/", async (req, res) => {
  try {
    const galleryData = await Gallery.find();
    return res.status(200).send(galleryData);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

routerGallery.post(
  "/",
  checkRole([1, 2, 3]),
  upload.single("galleryimage"),
  async (req, res) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          format: "webp",
        },
        async (error, result) => {
          if (error) {
            return res.status(500).send(error.message);
          }
          const imageUrl = result.secure_url;
          const gallery = new Gallery({
            image: imageUrl,
          });
          await gallery.save();
          return res.status(201).send(gallery);
        }
      );
      stream.end(req.file.buffer);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }
);

export default routerGallery;
