const fs = require("fs");
const LimitSizeStream = require("../01-limit-size-stream/LimitSizeStream");
module.exports = function uploadHelper(filepath, req, res) {
  const limitSizeStream = new LimitSizeStream({ limit: 1e6 });
  const writeStream = fs.createWriteStream(filepath, { flags: "wx" });

  req.pipe(limitSizeStream).pipe(writeStream);

  if (req.headers["content-length"] > 1e6) {
    res.statusCode = 413;
    res.end("File is too big!");
    return;
  }

  limitSizeStream.on("error", (err) => {
    if (err.code === "LIMIT_EXCEEDED") {
      res.statusCode = 413;
      res.end("File too big!");
    } else {
      res.statusCode = 500;
      res.end("Internal Error");
    }
    fs.unlink(filepath, (err) => {});
  });

  writeStream.on("error", (err) => {
    if (err.code === "EEXIST") {
      res.statusCode = 409;
      res.end("File exists");
    } else {
      res.statusCode = 500;
      res.end("Internal sever error");
      fs.unlink(filepath, (err) => {});
    }
  });

  writeStream.on("finish", () => {
    res.statusCode = 201;
    res.end("file has been saved");
  });

  req.on("aborted", () => {
    fs.unlink(filepath, (err) => {});
  });
};
