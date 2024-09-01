const jwt = require("jsonwebtoken");
const { getPermissionType } = require("../helpers/jwt");
const { formatError } = require("../helpers/formatError");

module.exports.validateCookie = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) res.status(401).json(formatError({"message": "Please Login First"}));
  if (!jwt.verify(token, process.env.JWT_SECRET)) return res.status(401).json(formatError({"message": "Please Login First"}));
  next();
};
 

module.exports.isTeacher = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401);
  if (!jwt.verify(token, process.env.JWT_SECRET)) return res.sendStatus(401);
  if (getPermissionType(token) != "teacher") return res.status(401).json(formatError({"message": "Please log in with teacher account"}));
  next();
}


module.exports.isStudent = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401);
  if (!jwt.verify(token, process.env.JWT_SECRET)) return res.sendStatus(401);
  if (getPermissionType(token) != "student") return res.status(401).json(formatError({"message": "Please Login with student account"}));
  next();
} 

module.exports.isAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(401);
  if (!jwt.verify(token, process.env.JWT_SECRET)) return res.sendStatus(401);
  console.log(jwt.decode(token))
  if (jwt.decode(token).admin){
    next();
  } else {
    res.sendStatus(401);
  }
}