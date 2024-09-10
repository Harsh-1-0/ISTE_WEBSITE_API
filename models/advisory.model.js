import mongoose, { Schema } from "mongoose";
const AdvisorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
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
  companyplaced: {
    type: String,
  },
});
const Advisory = mongoose.model("Advisory", AdvisorySchema);
export default Advisory;
