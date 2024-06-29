import express from "express";
import board from "../models/board.model.mjs";
import upload from "../config/multerconfig.mjs";
import cloudinary from "../config/cloudinary.mjs";
import checkRole from "../middleware/roleVerify.mjs";
import Board from "../models/board.model.mjs";
const routerBoard = new express.Router();

routerBoard.get("/", async (req, res) => {
  try {
    const response = await Board.find();
    return res.send(response).status(200);
  } catch (err) {
    console.log(err);
  }
});

routerBoard.get("/:regno", async (req, res) => {
  try {
    const response = await Board.findOne({ regno: req.params.regno });
    return res.send(response).status(200);
  } catch (err) {}
});

routerBoard.post(
  "/",
  checkRole([1, 2, 3]),
  upload.single("boardimage"),
  async (req, res) => {
    try {
      const { name, regno, position, linkedin, connectlink } = req.body;
      const checkDupe = await Board.findOne({ regno: req.body.regno });
      if (checkDupe) {
        return res.send("Duplicate registration number found").status(409);
      }
      if (!name || !regno || !position || !linkedin) {
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
          const board = new Board({
            name,
            regno,
            image: imageUrl,
            position,
            linkedin,
            connectlink,
          });
          await board.save();
          return res.send(board).status(201);
        }
      );
      stream.end(req.file.buffer);
    } catch (err) {
      console.log(err);
    }
  }
);

routerBoard.patch(
  "/:regno",
  checkRole([1, 2, 3]),
  upload.single("boardimage"),
  async (req, res) => {
    try {
      const board = await Board.findOne({ regno: req.params.regno });
      if (!board) {
        return res.send("No board found").status(404);
      }
      const { name, position, linkedin, connectlink } = req.body;
      if (name) board.name = name;
      if (position) board.position = position;
      if (linkedin) board.linkedin = linkedin;
      if (connectlink) board.connectlink = connectlink;
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
            board.image = imageUrl;
            await board.save();
            return res.status(200).send(board);
          }
        );
        stream.end(req.file.buffer);
      } else {
        await board.save();
        return res.send(board).status(200);
      }
    } catch (err) {
      console.log(err);
    }
  }
);

routerBoard.delete("/:regno", checkRole([1, 2]), async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ regno: req.params.regno });
    if (!board) return res.send("Board not found").status(404);
    else {
      return res.send("Board deleted").status(204);
    }
  } catch (err) {
    console.log(err);
  }
});

export default routerBoard;
