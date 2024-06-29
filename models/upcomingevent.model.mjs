import mongoose, { Schema } from "mongoose";
const UpcomingSchema = new Schema({
  id: {
    type: Number,
    default: 1,
  },
  link: {
    type: String,
    required: true,
  },
  width: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  frameboarder: {
    type: String,
    required: true,
  },
});
const upcomingEvent = mongoose.model("upcomingEvent", UpcomingSchema);
export default upcomingEvent;
