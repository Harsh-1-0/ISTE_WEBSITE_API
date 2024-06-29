import express from "express";
import upcomingEvent from "../models/upcomingevent.model.mjs";
import checkRole from "../middleware/roleVerify.mjs";

const routerUpcoming = express.Router();

routerUpcoming.get("/", checkRole([1, 2]), async (req, res) => {
  try {
    const UpcomingEvent = await upcomingEvent.find();
    return res.status(200).json(UpcomingEvent);
  } catch (err) {
    console.log(err);
  }
});

routerUpcoming.post("/", checkRole([1, 2]), async (req, res) => {
  try {
    const UpcomingEvent = new upcomingEvent(req.body);
    await UpcomingEvent.save();
  } catch (err) {
    console.log(err);
  }
});

routerUpcoming.put("/", checkRole([1, 2]), async (req, res) => {
  try {
    const UpcomingEvent = await upcomingEvent.findByIdAndUpdate(
      { id: 1 },
      req.body,
      { new: true }
    );
  } catch (err) {
    console.log(err);
  }
});

export default routerUpcoming;
