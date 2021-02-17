const isValidObjectId = (id) => {
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    return true;
  } else {
    return false;
  }
};

module.exports = isValidObjectId;
