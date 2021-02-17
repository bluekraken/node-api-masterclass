const advancedResults = (model, populate) => async (req, res, next) => {
  // Copy request query
  const reqQuery = { ...req.query };

  // Remove parameters from query
  const removeParams = ["select", "sort", "page", "limit"];
  removeParams.forEach((param) => delete reqQuery[param]);

  // Create query object
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\blt|lte|gt|gte|ne|in\b/g, (match) => `$${match}`);
  let queryObj = JSON.parse(queryStr);

  // Convert string values with '%' into regexs
  // Mongoose uses a regex for a like comparison
  // E.g. /name/ rather than %name%
  Object.keys(queryObj).forEach((key) => {
    let value = queryObj[key];
    if (typeof value === "string" && value.includes("%")) {
      value = value.replace(/%/g, "");
      queryObj[key] = new RegExp(value);
    }
  });

  // Allocate resource
  let query = model.find(queryObj);

  // Select fields to return
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort documents
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalDocs = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Populate virtuals
  if (populate) {
    query = query.populate(populate);
  }

  // Execute query
  const results = await query;

  // Pagination result
  const pagination = {};

  pagination.pages = Math.floor((totalDocs - 1) / limit) + 1;

  if (endIndex < totalDocs) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
