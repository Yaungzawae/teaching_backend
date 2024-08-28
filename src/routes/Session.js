const { createSession, getAllSessionsOfTeacher, getOneSession } = require("../controller/Session");
const { isTeacher } = require("../middlewares/validateCookie");

const Router = require("express").Router();

Router.post("/create", isTeacher ,createSession);

Router.post("/get", getAllSessionsOfTeacher);

Router.post("/get-one", getOneSession);

module.exports = Router;