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
  eventImages: {
    type: Array,
  },
});
const Horizon = mongoose.model("Horizon", EventSchema);
export default Horizon;
