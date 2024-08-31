
const path = require("path");
const { createTeacher, loginTeacher, getOneTeacher, getAllTeachers, editTeacherDetails, deleteTeacher, accessTeacher } = require("../controller/Teacher");
const { getUserId } = require("../helpers/jwt");
const { isTeacher } = require("../middlewares/validateCookie");
const multer = require("multer");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/profiles')
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      cb(null, "tmp" + extension)
    }
  })
  
  const upload = multer({ storage: storage })

//   const upload = multer({ dest: "assets" }) 


const Router = require("express").Router();

Router.post("/create", upload.single('img') ,createTeacher);

Router.post("/login", loginTeacher);

Router.post("/get-one-teacher", getOneTeacher);

Router.post("/get-all-teachers", getAllTeachers)

Router.post("/edit", upload.single('img') ,editTeacherDetails); 

Router.post("/delete", deleteTeacher);

Router.post("/access-teacher", accessTeacher);

// Router.post("/login", userValidator, handleValidatorError, loginUser);

// Router.post("/getOtp", getOtp);

module.exports = Router;