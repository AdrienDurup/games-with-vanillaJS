// const xpr = require("express");
// require("dotenv").config();
// xpr.locals = {};
const {srv} =require("./srv");
const {io} =require("./io");
const routes = require("./app/routes");

srv.use(routes);