import express from "express";
import upload from "../config/multerconfig.js";
import Event from "../models/rivera.model.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";

const RouterRivera = new express.Router();

RouterRivera.get("/", async (req, res) => {
  try {
    const response = await Event.find();
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// Updated to handle multiple images
RouterRivera.post(
  "/",
  checkRole([1, 2, 3]),
  upload.fields([
    { name: "eventimage", maxCount: 1 },
    { name: "eventGallery", maxCount: 5 }, // Allow up to 5 gallery images
  ]),
  async (req, res) => {
    try {
      const { title, description, speaker, venue } = req.body;
      let mainImageUrl;
      let galleryUrls = [];

      // Upload main image
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
        mainImageUrl = mainImageResult.secure_url;
      }

      // Upload gallery images
      if (req.files.eventGallery) {
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
          galleryUrls.push(galleryResult.secure_url);
        }
      }

      const event = new Event({
        title,
        description,
        speaker,
        image: mainImageUrl,
        venue,
        eventImages: galleryUrls,
      });

      await event.save();
      res.status(201).send(event);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  }
);

RouterRivera.get("/:title", async (req, res) => {
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

RouterRivera.delete("/:title", checkRole([1, 2]), async (req, res) => {
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

RouterRivera.patch(
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
RouterRivera.delete("/:title/gallery", async (req, res) => {
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

export default RouterRivera;
