import express from "express";
import upload from "../config/multerconfig.js";
import Event from "../models/event.model.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";

const RouterEvent = new express.Router();

RouterEvent.get("/", async (req, res) => {
  try {
    const response = await Event.find();
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
  }
});

RouterEvent.post(
  "/",
  checkRole([1, 2, 3]),
  upload.single("eventimage"),
  async (req, res) => {
    try {
      const { title, description, speaker, venue } = req.body;

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
          const event = new Event({
            title,
            description,
            speaker,
            image: imageUrl,
            venue,
          });
          await event.save();
          res.status(201).send(event);
        }
      );
      stream.end(req.file.buffer);
    } catch (err) {
      console.log(err);
    }
  }
);

RouterEvent.get("/:title", async (req, res) => {
  try {
    const response = await Event.findOne({ title: req.params.title });
    if (!response) {
      return res.status(404).send("No Event found");
    } else {
      return res.status(200).send(response);
    }
  } catch (err) {
    console.log(err);
  }
});

RouterEvent.delete("/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const response = await Event.findOneAndDelete({ title: title });
    if (!response) return res.status(404).send("Event not found");
    else {
      return res.status(204).send("Event deleted");
    }
  } catch (err) {
    console.log(err);
  }
});

RouterEvent.patch("/:title", upload.single("eventimage"), async (req, res) => {
  try {
    const { title } = req.params;
    const { description, speaker, venue } = req.body;
    const event = await Event.findOne({ title: title });
    if (!event) return res.status(404).send("Event not found");
    if (description) event.description = description;
    if (speaker) event.speaker = speaker;
    if (venue) event.venue = venue;
    if (req.file) {
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
          event.image = imageUrl;
          await event.save();
          return res.status(200).send(event);
        }
      );
      stream.end(req.file.buffer);
    } else {
      await Event.save();
      return res.status(201).send(event);
    }
  } catch (Err) {
    console.log(Err);
  }
});

export default RouterEvent;
