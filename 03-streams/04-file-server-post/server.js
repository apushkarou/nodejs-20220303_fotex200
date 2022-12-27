const url = require("url");
const http = require("http");
const path = require("path");
const uploadHelper = require("./uploadHelper");

const server = new http.Server();

server.on("request", (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, "files", pathname);

  if (pathname.includes("/") || pathname.includes("..")) {
    res.statusCode = 400;
    res.end("Nested paths are not allowed");
  }

  switch (req.method) {
    case "POST":
      uploadHelper(filepath, req, res);
      break;

    default:
      res.statusCode = 501;
      res.end("Not implemented");
  }
});

module.exports = server;
