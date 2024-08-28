module.exports.formatError = (...errorObjects) => {
    console.log(errorObjects);
    const errorMessage = { errors: {} };
    errorObjects.forEach(
      (errorObject) =>
        (errorMessage.errors[Object.keys(errorObject)[0]] =
          Object.values(errorObject)[0])
    );
    return errorMessage;
  };
  
  module.exports.formatExpressValidatorError = (errorArray) => {
    const errorMessage = { errors: {} };
    errorArray.forEach((err) => (errorMessage.errors[err.path] = err.msg));
    return errorMessage;
  };
  
  module.exports.formatMongooseUniqueError = (errorObject) => {
    const errorMessage = { errors: {} };
    const errorArray = Object.entries(errorObject);
    errorArray.forEach(
      ([path, err]) => (errorMessage.errors[path] = err.properties.message)
    );
    return errorMessage;
  };


  module.exports.serverError = (res) => { 
    return res.status(500).json({message: "Sever Error"});
  }