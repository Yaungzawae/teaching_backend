
const path = require("path");
const { createClass, getAllClassesOfTeacher, registerClass, confirmRegistration, editClass, getStudents, deleteClass, getOneClass } = require("../controller/Class");
const { isTeacher } = require("../middlewares/validateCookie");

const multer = require("multer");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/text-books')
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + extension)
    }
  })
  
  const upload = multer({ storage: storage })

const Router = require("express").Router();

Router.post("/create", isTeacher, upload.single("textBook") ,createClass);

Router.post("/get", getAllClassesOfTeacher);

Router.post("/get-students", getStudents);

Router.post("/register", registerClass);

Router.post("/edit", isTeacher, upload.single("textBook") ,editClass);

Router.post("/delete-class", isTeacher, deleteClass);

Router.post("/register-class", registerClass);

Router.post("/confirm-registration", confirmRegistration);

Router.post("/get-one", getOneClass);
 
module.exports = Router; 