import express from "express";
import upload from "../config/multerconfig.js";
import Core from "../models/core.model.js";
import checkRole from "../middleware/roleVerify.js";
import cloudinary from "../config/cloudinary.js";
const routerCore = express.Router();

routerCore.get("/", async (req, res) => {
  try {
    const coreData = await Core.find();
    return res.send(coreData).status(200);
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
      const { name, regno, domain, linkedin, connectlink } = req.body;
      const checkDupe = await Core.findOne({ regno: req.body.regno });
      if (checkDupe) {
        return res.send("Duplicate registration number found").status(409);
      }
      if (!name || !regno || !domain || !linkedin) {
        return res.send("All fields are required").status(403);
      }
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          format: "webp",
        },
        async (error, result) => {
          if (error) {
            return res.status(500).send(error.message);
          }
          const imageUrl = result.secure_url;
          const core = new Core({
            name,
            regno,
            image: imageUrl,
            domain,
            linkedin,
            connectlink,
          });
          await core.save();
          return res.send(core).status(201);
        }
      );
      stream.end(req.file.buffer);
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
      return res.send("Core not found").status(404);
    } else {
      return res.send(core).status(200);
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
      const { name, domain, linkedin, connectlink } = req.body;
      const core = await Core.findOne({ regno: req.params.regno });
      if (!core) {
        return res.send("Core Member not found").status(404);
      }
      if (name) core.name = name;

      if (domain) core.domain = domain;
      if (linkedin) core.linkedin = linkedin;
      if (connectlink) core.connectlink = connectlink;

      if (req.file) {
        console.log("Yes");
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            format: "webp",
          },
          async (error, result) => {
            if (error) {
              return res.status(500).send(error.message);
            }
            const imageUrl = result.secure_url;
            core.image = imageUrl;
            await core.save();
            return res.status(200).send(core);
          }
        );
        stream.end(req.file.buffer);
      } else {
        await core.save();
        return res.send(core).status();
      }
    } catch (err) {
      console.log(err);
    }
  }
);

routerCore.delete("/:regno", checkRole([1, 2]), async (req, res) => {
  try {
    const core = await Core.findOneAndDelete({ regno: req.params.regno });
    if (!core) return res.send("Core not found").status(404);
    else {
      return res.send("Core deleted").status(204);
    }
  } catch (err) {
    console.log(err);
  }
});

export default routerCore;
