import mongoose, { Schema } from "mongoose";
const CoreSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  regno: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  linkedin: {
    type: String,
    required: true,
  },
  connectlink: {
    type: String,
  },
});
const Core = mongoose.model("core", CoreSchema);
export default Core;
