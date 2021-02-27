const queryByBootcampId = (req, res, next) => {
  req.query = {
    bootcamp: req.params.bootcampId
  };

  next();
};

module.exports = queryByBootcampId;
