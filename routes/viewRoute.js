const url = require("url");
const path = require("path");
const fs = require("fs");

/**
 * A simple function to serve `/views/*`
 */
function viewRouter(req, res) {
    const urlobj = url.parse(req.url);
    const pathname = urlobj.pathname;
    const filepath = "." + pathname;
    const ext = path.extname(filepath);
    let contentType = "text/html";
    switch (ext) {
    case ".js":
        contentType = "text/javascript";
        break;
    case ".css":
        contentType = "text/css";
        break;
    case ".png":
        contentType = "image/png";
        break;
    case ".jpg":
    case ".jpeg":
        contentType = "image/jpg";
        break;
    }
    fs.exists(filepath, function handleExists(exist) {
        if (!exist) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "File not found." }));
            return;
        }

        if (fs.statSync(filepath).isDirectory()) filepath += "/index" + ext;

        fs.readFile(filepath, function handleReadFile(err, data) {
            if (err) {
                res.statusCode = 500;
                res.end("Internal Server Error getting file.");
                console.error(err);
            } else {
                res.setHeader("Content-Type", contentType);
                res.end(data);
            }
        })
    })
}

module.exports = viewRouter;
