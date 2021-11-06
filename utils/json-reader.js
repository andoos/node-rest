const fs = require("fs");

function jsonReader(path) {
  try {
    const fileData = fs.readFileSync(path);
    const object = JSON.parse(fileData);
    return object;
  } catch (err) {
    return err;
  }
}

module.exports = { jsonReader };
