import express from "express";
import upload from "../config/multerconfig.js";
import Gallery from "../models/gallery.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();
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
      if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files uploaded.");
      }

      if (req.files) {
        for (const file of req.files) {
          const galleryResult = await axios.post(
            `${process.env.IMGBB_URL}?key=${process.env.IMGBB_API_KEY}`,
            { image: file.buffer.toString("base64") },
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          const newImage = new Gallery({
            image: galleryResult.data.data.url,
          });
          await newImage.save();
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
