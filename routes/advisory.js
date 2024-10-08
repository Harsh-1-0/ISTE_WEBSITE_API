import express from "express";
import checkRole from "../middleware/roleVerify.js";
import upload from "../config/multerconfig.js";
import Advisory from "../models/advisory.model.js";
import cloudinary from "../config/cloudinary.js";

const routerAdvisory = express.Router();

routerAdvisory.get("/", async (req, res) => {
  try {
    const advisory = await Advisory.find();
    res.status(200).send(advisory);
  } catch (err) {
    console.log(err);
  }
});
routerAdvisory.get("/:regno", async (req, res) => {
  try {
    const advisory = await Advisory.findOne({ regno: req.params.regno });
    if (!advisory) {
      return res
        .status(404)
        .send(`No one found with reg no : ${req.params.regno}`);
    }
    res.status(200).send(advisory);
  } catch (err) {
    console.log(err);
  }
});
routerAdvisory.post("/", upload.single("advisoryimage"), async (req, res) => {
  try {
    const {
      name,
      surname,
      regno,
      position,
      linkedin,
      connectlink,
      companyplaced,
    } = req.body;
    const checkDupe = await Advisory.findOne({ regno: req.body.regno });
    if (checkDupe) {
      res.status(409).send("Duplicate registration number found");
    }
    if (!name || !regno || !position || !linkedin) {
      res.status(403).send("All fields are required");
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
        const advisoryM = new Advisory({
          name,
          surname,
          regno,
          image: imageUrl,
          position,
          linkedin,
          connectlink,
          companyplaced,
        });
        await advisoryM.save();
        res.status(201).send(advisoryM);
      }
    );
    stream.end(req.file.buffer);
  } catch (err) {
    console.log(err);
  }
});

routerAdvisory.patch(
  "/:regno",
  checkRole([1, 2, 3]),
  upload.single("advisoryimage"),
  async (req, res) => {
    try {
      const advisory = await Advisory.findOne({ regno: req.params.regno });
      if (!advisory) {
        return res.status(404).send("No advisory found");
      }
      const { name, surname, position, linkedin, connectlink, companyplaced } =
        req.body;
      if (name) advisory.name = name;
      if (position) advisory.position = position;
      if (linkedin) advisory.linkedin = linkedin;
      if (connectlink) advisory.connectlink = connectlink;
      if (companyplaced) advisory.companyplaced = companyplaced;
      if (surname) advisory.surname = surname;
      if (req.file) {
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
            advisory.image = imageUrl;
            await advisory.save();
            return res.status(200).send(board);
          }
        );
        stream.end(req.file.buffer);
      } else {
        await advisory.save();
        return res.status(200).send(advisory);
      }
    } catch (err) {
      console.log(err);
    }
  }
);

routerAdvisory.delete("/:regno", checkRole([1, 2]), async (req, res) => {
  try {
    const core = await Advisory.findOneAndDelete({ regno: req.params.regno });
    if (!core) res.status(404).send("Core not found");
    else {
      res.status(204).send("Advisory Board deleted");
    }
  } catch (err) {
    console.log(err);
  }
});

export default routerAdvisory;
