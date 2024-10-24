import mongoose, { Schema } from "mongoose";
const EventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  speaker: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
});
const Event = mongoose.model("Event", EventSchema);
export default Event;
