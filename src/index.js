require("dotenv").config();
const express = require("express");
const db = require("./config/db.config.js");
const cookieParser = require("cookie-parser");

const authRoute = require("./routes/Auth.js");
const teacherAuth = require("./routes/Teacher.js")
const sessionRoute = require("./routes/Session.js");

const classRoute = require("./routes/Class.js");
const paymentRoute = require("./routes/Payment.js");
const UserRoute = require("./routes/User.js");
const path = require("path");





const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static('uploads'));

app.use("/api/auth", authRoute);

app.use("/api/teacher", teacherAuth );

app.use("/api/session", sessionRoute);

app.use("/api/class", classRoute)

app.use("/api/payment", paymentRoute);

app.use("/api/user", UserRoute);

app.use(express.static(__dirname + "/views/dist"))

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '/views/dist', 'index.html'));
  });
  

app.listen(process.env.PORT, ()=>{  
    console.log(`Server is running on PORT ${process.env.PORT}`)
})