import express from "express";
import jwt from "jsonwebtoken";
import webadmin from "../models/webadmin.js";
import checkRole from "../middleware/roleVerify.js";
import verifyToken from "../middleware/googleVerifyToken.js";

const routerAdmin = express.Router();
import dotenv from "dotenv";
dotenv.config();

routerAdmin.post("/signup", verifyToken, async (req, res) => {
  const { uid, email, name, picture } = req.user;
  if (!uid) {
    return res.status(400).send("Invalid user ID");
  }

  try {
    let user = await webadmin.findOne({ uid });
    if (!user) {
      user = new webadmin({ uid, email, name, photoURL: picture });
      await user.save();
      return res.status(201).send("Signed UP");
    }
    res.status(403).send("User already exists");
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

routerAdmin.post("/login", verifyToken, async (req, res) => {
  const { uid, email, name, picture } = req.user;
  if (!uid) {
    return res.status(400).send("Invalid user ID");
  }
  try {
    let user = await webadmin.findOne({ uid });

    if (user) {
      const token = jwt.sign(user.toObject(), process.env.SECRET_KEY, {
        expiresIn: "2d",
      });
      res.send(token).status(200);
    } else {
      res.send("User Not Found").status(404);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

routerAdmin.get("/dashboard", checkRole([1, 2, 3]), async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Authorization header is missing");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(401).send("Invalid token");
    } else {
      res.send(decoded).status(200);
    }
  });
});

export default routerAdmin;
