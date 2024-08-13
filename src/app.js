import Express from "express";
import configDB from "../config/mongodb.js";

import routerAdmin from "../routes/admin.js";
import routerSuper from "../routes/super_admin.js";

import routerCore from "../routes/core.js";
import routerBoard from "../routes/board.js";
import routerAdvisory from "../routes/advisory.js";
import routerUpcoming from "../routes/upcomingevent.js";

import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://20.197.4.190/"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
  })
);
app.use(cors(corsOptions));

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
