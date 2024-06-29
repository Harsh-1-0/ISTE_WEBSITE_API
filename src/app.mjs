import Express from "express";
import configDB from "../config/mongodb.mjs";

import routerAdmin from "../routes/admin.mjs";
import routerSuper from "../routes/super_admin.mjs";

import routerCore from "../routes/core.mjs";
import routerBoard from "../routes/board.mjs";
import routerAdvisory from "../routes/advisory.mjs";
import routerUpcoming from "../routes/upcomingevent.mjs";

import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
const app = Express();
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};
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
