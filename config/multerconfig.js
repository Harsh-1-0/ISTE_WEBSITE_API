import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/webp" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error("Invalid mime type. Only WEBP, PNG, and JPG are allowed!"),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
  fileFilter: fileFilter,
});

export default upload;
