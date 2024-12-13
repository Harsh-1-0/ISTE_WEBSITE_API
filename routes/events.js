import express from "express";
import upload from "../config/multerconfig.js";
import Event from "../models/event.model.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";

const RouterEvent = new express.Router();

RouterEvent.get("/", async (req, res) => {
  try {
    const response = await Event.find();
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// Updated to handle multiple images
RouterEvent.post(
  "/",
  checkRole([1, 2, 3]),
  upload.fields([
    { name: "eventimage", maxCount: 1 },
    { name: "eventGallery", maxCount: 5 }, // Allow up to 5 gallery images
  ]),
  async (req, res) => {
    try {
      const { title, description, speaker, venue, type, date } = req.body;
      let galleryUrls = [];
      let mainImage;
      // Upload main image
      if (req.files.eventimage) {
        const file = req.files.eventimage[0];
        mainImage = await axios.post(
          `${process.env.IMGBB_URL}?key=${process.env.IMGBB_API_KEY}`,
          { image: file.buffer.toString("base64") },
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }
      // Upload gallery images
      if (req.files.eventGallery) {
        for (const file of req.files.eventGallery) {
          const buffer = await file.buffer.toString("base64");

          const galleryResult = await axios.post(
            `${process.env.IMGBB_URL}?key=${process.env.IMGBB_API_KEY}`,
            { image: buffer },
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          console.log(galleryResult.data.data.url);
          galleryUrls.push(galleryResult.data.data.url);
        }
      }

      const event = new Event({
        title,
        description,
        speaker,
        image: mainImage.data.data.url,
        venue,
        eventImages: galleryUrls,
        date,
        type,
      });

      await event.save();
      res.status(201).send(event);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  }
);

RouterEvent.get("/:title", async (req, res) => {
  try {
    const response = await Event.findOne({ title: req.params.title });
    if (!response) {
      return res.status(404).send("No Event found");
    }
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

RouterEvent.delete("/:title", checkRole([1, 2]), async (req, res) => {
  try {
    const { title } = req.params;
    const response = await Event.findOneAndDelete({ title: title });
    if (!response) return res.status(404).send("Event not found");
    return res.status(204).send("Event deleted");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

RouterEvent.patch(
  "/:title",
  checkRole([1, 2]),
  upload.fields([
    { name: "eventimage", maxCount: 1 },
    { name: "eventGallery", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { title } = req.params;
      const { description, speaker, venue, removeImages } = req.body;
      const event = await Event.findOne({ title: title });

      if (!event) return res.status(404).send("Event not found");

      // Update text fields
      if (description) event.description = description;
      if (speaker) event.speaker = speaker;
      if (venue) event.venue = venue;

      // Handle main image update
      if (req.files.eventimage) {
        const mainImageResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              format: "webp",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.files.eventimage[0].buffer);
        });
        event.image = mainImageResult.secure_url;
      }

      // Handle gallery images update
      if (req.files.eventGallery) {
        const newGalleryUrls = [];
        for (const file of req.files.eventGallery) {
          const galleryResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "image",
                format: "webp",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          newGalleryUrls.push(galleryResult.secure_url);
        }

        // If removeImages is true, replace all images, otherwise append new ones
        if (removeImages === "true") {
          event.eventImages = newGalleryUrls;
        } else {
          event.eventImages = [...event.eventImages, ...newGalleryUrls];
        }
      }

      await event.save();
      return res.status(200).send(event);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  }
);

// New route to remove specific gallery images
RouterEvent.delete("/:title/gallery", async (req, res) => {
  try {
    const { title } = req.params;
    const { imageUrls } = req.body; // Array of image URLs to remove

    const event = await Event.findOne({ title: title });
    if (!event) return res.status(404).send("Event not found");

    event.eventImages = event.eventImages.filter(
      (url) => !imageUrls.includes(url)
    );

    await event.save();
    return res.status(200).send(event);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

export default RouterEvent;
