import express from "express";
import upload from "../config/multerconfig.js";
import cloudinary from "../config/cloudinary.js";
import checkRole from "../middleware/roleVerify.js";
import Board from "../models/board.model.js";
const routerBoard = new express.Router();

routerBoard.get("/", async (req, res) => {
  try {
    const response = await Board.find();
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
  }
});

routerBoard.get("/:regno", async (req, res) => {
  try {
    const response = await Board.findOne({ regno: req.params.regno });
    return res.status(200).send(response);
  } catch (err) {}
});

routerBoard.post(
  "/",
  checkRole([1, 2, 3]),
  upload.single("boardimage"),
  async (req, res) => {
    try {
      const { name, surname, regno, position, linkedin, connectlink } =
        req.body;
      const checkDupe = await Board.findOne({ regno: req.body.regno });
      if (checkDupe) {
        return res.status(409).send("Duplicate registration number found");
      }
      if (!name || !regno || !position || !linkedin) {
        return res.status(403).send("All fields are required");
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
            surname,
            regno,
            image: imageUrl,
            position,
            linkedin,
            connectlink,
          });
          await board.save();
          return res.status(201).send(board);
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
        return res.status(404).send("No board found");
      }
      const { name, surname, position, linkedin, connectlink } = req.body;
      if (name) board.name = name;
      if (position) board.position = position;
      if (linkedin) board.linkedin = linkedin;
      if (connectlink) board.connectlink = connectlink;
      if (surname) board.surname = surname;
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
        return res.status(200).send(board);
      }
    } catch (err) {
      console.log(err);
    }
  }
);

routerBoard.delete("/:regno", checkRole([1, 2]), async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ regno: req.params.regno });
    if (!board) return res.status(404).send("Board not found");
    else {
      return res.status(204).send("Board deleted");
    }
  } catch (err) {
    console.log(err);
  }
});

export default routerBoard;
