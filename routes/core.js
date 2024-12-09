import express from "express";
import upload from "../config/multerconfig.js";
import Core from "../models/core.model.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
const routerCore = express.Router();

routerCore.get("/", async (req, res) => {
  try {
    const coreData = await Core.find();
    return res.status(200).send(coreData);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

routerCore.post(
  "/",
  checkRole([1, 2, 3]),
  upload.single("coreimage"),
  async (req, res) => {
    try {
      const { name, regno, surname, domain, linkedin, connectlink } = req.body;
      const checkDupe = await Core.findOne({ regno: req.body.regno });
      if (checkDupe) {
        return res.status(409).send("Duplicate registration number found");
      }
      if (!name || !regno || !domain || !linkedin) {
        return res.status(403).send("All fields are required");
      }
      const file = req.file;
      const galleryResult = await axios.post(
        `${process.env.IMGBB_URL}?key=${process.env.IMGBB_API_KEY}`,
        { image: file.buffer.toString("base64") },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const core = new Core({
        name,
        surname,
        regno,
        image: galleryResult.data.data.url,
        domain,
        linkedin,
        connectlink,
      });
      await core.save();
      return res.status(201).send(core);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  }
);

routerCore.get("/:regno", async (req, res) => {
  try {
    const core = await Core.findOne({ regno: req.params.regno });
    if (!core) {
      return res.status(404).send("Core not found");
    } else {
      return res.status(200).send(core);
    }
  } catch (err) {
    console.log(err);
  }
});

routerCore.patch(
  "/:regno",
  checkRole([1, 2, 3]),
  upload.single("coreimage"),
  async (req, res) => {
    try {
      const { name, surname, domain, linkedin, connectlink } = req.body;
      const core = await Core.findOne({ regno: req.params.regno });
      if (!core) {
        return res.status(404).send("Core Member not found");
      }
      if (name) core.name = name;

      if (domain) core.domain = domain;
      if (linkedin) core.linkedin = linkedin;
      if (connectlink) core.connectlink = connectlink;
      if (surname) core.surname = surname;

      if (req.file) {
        const file = req.file;
        const galleryResult = await axios.post(
          `${process.env.IMGBB_URL}?key=${process.env.IMGBB_API_KEY}`,
          { image: file.buffer.toString("base64") },
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        core.image = galleryResult.data.data.url;
        core.save();
        return res.status(200).send(core);
      } else {
        await core.save();
        return res.status(201).send(core);
      }
    } catch (err) {
      console.log(err);
    }
  }
);

routerCore.delete("/:regno", checkRole([1, 2]), async (req, res) => {
  try {
    const core = await Core.findOneAndDelete({ regno: req.params.regno });
    if (!core) return res.status(404).send("Core not found");
    else {
      return res.status(204).send("Core deleted");
    }
  } catch (err) {
    console.log(err);
  }
});

export default routerCore;
