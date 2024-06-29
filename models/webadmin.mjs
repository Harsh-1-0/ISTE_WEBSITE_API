import mongoose, { Schema } from "mongoose";
const adminsSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    photoURL: {
      type: String,
    },
    role: {
      type: Number,
      default: 0,
      //1 for super admin, 2 for board, 3 for core
    },
  },
  { timestamps: true }
);

const webadmin = mongoose.model("admin", adminsSchema);
export default webadmin;
