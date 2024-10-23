import express from "express";
import upcomingEvent from "../models/upcomingEvent.moodel.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";
import upload from "../config/multerconfig.js";

const routerUpcoming = express.Router();

routerUpcoming.get("/", async (req, res) => {
  try {
    const UpcomingEvent = await upcomingEvent.find();
    return res.status(200).json(UpcomingEvent);
  } catch (err) {
    console.log(err);
  }
});

routerUpcoming.post(
  "/",
  checkRole([1, 2]),
  upload.single("upcoming"),
  async (req, res) => {
    try {
      const UpcomingEvent = new upcomingEvent(req.body);
      await UpcomingEvent.save();
    } catch (err) {
      console.log(err);
    }
  }
);

routerUpcoming.put(
  "/",
  checkRole([1, 2, 3]),
  upload.single("upcoming"),
  async (req, res) => {
    try {
      const UpcomingEvent = await upcomingEvent.findOne({ id: 1 });
      const { title, description, speaker, venue, date, time } = req.body;
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
          UpcomingEvent.title = title;
          UpcomingEvent.description = description;
          UpcomingEvent.speaker = speaker;
          UpcomingEvent.venue = venue;
          UpcomingEvent.date = date;
          UpcomingEvent.time = time;
          UpcomingEvent.image = imageUrl;
          await UpcomingEvent.save();
          return res.status(204).send(UpcomingEvent);
        }
      );
      req.file.stream.pipe(stream);
    } catch (err) {
      console.log(err);
    }
  }
);

export default routerUpcoming;
