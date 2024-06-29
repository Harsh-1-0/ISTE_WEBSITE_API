import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const checkRole = (validRoles) => {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send("Authorization header is missing");
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(401).send("Invalid token");
      }

      const role = decoded.role;

      if (role === 0) {
        return res
          .status(401)
          .send("Admin not whitelisted, wait for superadmin to do so");
      }

      if (validRoles.includes(role)) {
        next();
      } else {
        res.status(401).send("You are not allowed to access this route");
      }
    });
  };
};

export default checkRole;
