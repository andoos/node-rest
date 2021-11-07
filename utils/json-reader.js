const fs = require("fs").promises;

async function jsonReader(path) {
  try {
    const fileData = await fs.readFile(path);
    const object = await JSON.parse(fileData);
    return object;
  } catch (err) {
    return err;
  }
}

module.exports = { jsonReader };
