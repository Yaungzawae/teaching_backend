const mongoose = require("mongoose");
const db = mongoose.connect(process.env.MONGOOSE_URL);
module.exports = db;