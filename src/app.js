import Express from "express";
import configDB from "../config/mongodb.js";
const app = Express();

import routerAdmin from "../routes/admin.js";
import routerSuper from "../routes/super_admin.js";

import routerCore from "../routes/core.js";
import routerBoard from "../routes/board.js";
import routerAdvisory from "../routes/advisory.js";
import routerUpcoming from "../routes/upcomingevent.js";
import routerGallery from "../routes/gallery.js";

import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://20.197.4.190",
      "https://istevit.vercel.app",
      "https://istevit.in/",
    ], // Allowed origins
    credentials: true, // Allows the server to accept cookies or other credentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"], // Allowed headers
    preflightContinue: false, // Pass the CORS preflight response to the next handler
    optionsSuccessStatus: 204, // Status code for successful OPTIONS requests
  })
);

app.use(morgan("dev"));
app.use(Express.json());

configDB();
const port = 5500;

app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));

app.use("/superAdmin", routerSuper);
app.use("/admin", routerAdmin);
app.use("/core", routerCore);
app.use("/board", routerBoard);
app.use("/advisory", routerAdvisory);
app.use("/upcoming", routerUpcoming);
app.use("/gallery", routerGallery);

app.get("/heartbeat", async (req, res) => {
  res.send("Working").status(200);
});
app.get("/", async (req, res) => {
  res.send("Working").status(200);
});

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
