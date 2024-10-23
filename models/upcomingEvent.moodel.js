import mongoose, { Schema } from "mongoose";

const UpcomingEventSchema = new Schema({
  id: {
    type: Number,
    default: 1,
  },
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  speaker: {
    type: String,
  },
  venue: {
    type: String,
  },
  description: {
    type: String,
  },
});

const upcomingEvent = new mongoose.model("upcomingEvent", UpcomingEventSchema);
export default upcomingEvent;
