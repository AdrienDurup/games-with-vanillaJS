const http = require("http");
const xpr = require("express");
require("dotenv").config();

const srv = xpr();

const port = process.env.PORT;

const server = http.createServer(srv);

server.listen(port, () => {
    console.log(`Pente server running on ${port}`);
});

module.exports = {
    xpr,
    srv,
    server
}



