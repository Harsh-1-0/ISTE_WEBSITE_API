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
  upload.array("galleryimage"),
  async (req, res) => {
    try {
      console.log(typeof req.files);
      if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files uploaded.");
      }

      if (req.files) {
        const newGalleryUrls = [];
        for (const file of req.files) {
          const galleryResult = await new Promise((resove, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "image",
                format: "webp",
              },
              (error, result) => {
                if (error) reject(error);
                else resove(result);
              }
            );
            stream.end(file.buffer);
          });
          // newGalleryUrls.push();
          const newImage = new Gallery({
            image: galleryResult.secure_url,
          });
          newImage.save();
        }
        return res.status(201).send("Gallery images uploaded successfully.");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }
);

export default routerGallery;
