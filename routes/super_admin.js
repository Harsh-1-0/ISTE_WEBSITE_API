import express from "express";
import checkRole from "../middleware/roleVerify.js";
import webadmin from "../models/webadmin.js";
const routerSuper = express.Router();

routerSuper.use(checkRole([1]));
routerSuper.get("/", async (req, res) => {
  try {
    const admins = await webadmin.find();
    res.send(admins).status(200);
  } catch (err) {
    console.log(err);
  }
});
routerSuper.get("/:email", async (req, res) => {
  try {
    const admins = await webadmin.findOne({ email: req.params.email });
    res.send(admins).status(200);
  } catch (err) {
    console.log(err);
  }
});

routerSuper.patch("/:email", async (req, res) => {
  try {
    const admin = await webadmin.findOneAndUpdate(
      { email: req.params.email },
      { role: req.body.role },
      { new: true }
    );
    if (!admin) {
      res.send("Admin Not Found").status(404);
    }
    res.send(admin).status(200);
  } catch (err) {
    console.log(err);
  }
});

routerSuper.delete("/:email", async (req, res) => {
  try {
    const admin = await webadmin.findOneAndDelete({ email: req.params.email });
    if (!admin) {
      res.send("Admin Not Found").status(404);
    }
    res.send(`Admin deleted ${admin}`).status(200);
  } catch (err) {
    console.log(err);
  }
});

export default routerSuper;
