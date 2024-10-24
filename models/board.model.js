import mongoose, { Schema } from "mongoose";
const BoardSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
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
  position: {
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
const board = mongoose.model("board", BoardSchema);
export default board;
