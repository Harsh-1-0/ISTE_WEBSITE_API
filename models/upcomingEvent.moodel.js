import mongoose, { Schema } from "mongoose";

const UpcomingEventSchema = new Schema({
  id: {
    type: Number,
    required: true,
    default: 1,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
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
