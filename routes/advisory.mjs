import express from "express";
import checkRole from "../middleware/roleVerify.mjs";
import upload from "../config/multerconfig.mjs";
import Advisory from "../models/advisory.model.mjs";
import cloudinary from "../config/cloudinary.mjs";

const routerAdvisory = express.Router();

routerAdvisory.get("/", async (req, res) => {
  try {
    const advisory = await Advisory.find();
    res.send(advisory).status(200);
  } catch (err) {
    console.log(err);
  }
});
routerAdvisory.get("/:regno", async (req, res) => {
  try {
    const advisory = await Advisory.findOne({ regno: req.params.regno });
    if (!advisory) {
      return res
        .send(`No one found with reg no : ${req.params.regno}`)
        .status(404);
    }
    res.send(advisory).status(200);
  } catch (err) {
    console.log(err);
  }
});
routerAdvisory.post("/", upload.single("advisoryimage"), async (req, res) => {
  try {
    const { name, regno, position, linkedin, connectlink, companyplaced } =
      req.body;
    const checkDupe = await Advisory.findOne({ regno: req.body.regno });
    if (checkDupe) {
      res.send("Duplicate registration number found").status(409);
    }
    if (!name || !regno || !position || !linkedin) {
      res.send("All fields are required").status(403);
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
        const advisoryM = new advisory({
          name,
          regno,
          image: imageUrl,
          position,
          linkedin,
          connectlink,
        });
        await advisoryM.save();
        res.send(advisoryM).status(201);
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
        return res.send("No advisory found").status(404);
      }
      const { name, position, linkedin, connectlink, companyplaced } = req.body;
      if (name) advisory.name = name;
      if (position) advisory.position = position;
      if (linkedin) advisory.linkedin = linkedin;
      if (connectlink) advisory.connectlink = connectlink;
      if (companyplaced) advisory.companyplaced = companyplaced;
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
        return res.send(advisory).status(200);
      }
    } catch (err) {
      console.log(err);
    }
  }
);

routerAdvisory.delete("/:regno", checkRole([1, 2]), async (req, res) => {
  try {
    const core = await Advisory.findOneAndDelete({ regno: req.params.regno });
    if (!core) res.send("Core not found").status(404);
    else {
      res.send("Advisory Board deleted").status(204);
    }
  } catch (err) {
    console.log(err);
  }
});

export default routerAdvisory;
