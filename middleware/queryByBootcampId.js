const queryByBootcampId = (req, res, next) => {
  req.query = {
    bootcamp: req.params.bootcampId
  };
  console.log(req.query);

  next();
};

module.exports = queryByBootcampId;
