import express from "express";
import upcomingEvent from "../models/upcomingEvent.moodel.js";
import checkRole from "../middleware/roleVerify.js";
import upload from "../config/multerconfig.js";
import axios from "axios";
const routerUpcoming = express.Router();

routerUpcoming.get("/", async (req, res) => {
  try {
    const UpcomingEvent = await upcomingEvent.find();
    return res.status(200).json(UpcomingEvent);
  } catch (err) {
    console.log(err);
  }
});

routerUpcoming.put(
  "/",
  checkRole([1, 2, 3]),
  upload.single("upcoming"),
  async (req, res) => {
    try {
      const UpcomingEvent = await upcomingEvent.findOne({ id: 1 });
      const { title, description, speaker, venue, date, time } = req.body;
      const file = req.file;
      const galleryResult = await axios.post(
        `${process.env.IMGBB_URL}?key=${process.env.IMGBB_API_KEY}`,
        { image: file.buffer.toString("base64") },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      UpcomingEvent.title = title;
      UpcomingEvent.description = description;
      UpcomingEvent.speaker = speaker;
      UpcomingEvent.venue = venue;
      UpcomingEvent.date = date;
      UpcomingEvent.time = time;
      UpcomingEvent.image = galleryResult.data.data.url;
      await UpcomingEvent.save();
      return res.send(UpcomingEvent).status(200);
    } catch (err) {
      console.log(err);
    }
  }
);

export default routerUpcoming;
