const jwt = require("jsonwebtoken");

module.exports.createCookie = (payload, duration = "24h") => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: duration,
  });
  return token;
};

module.exports.getUserId = (token) => {
  const decoded = jwt.decode(token);
  return decoded ? jwt.decode(token).id : decoded;
};

module.exports.getPermissionType = (token) => {
  return jwt.decode(token).permission;
}

