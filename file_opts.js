const fs = require("fs").promises;

async function fileExists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(filePath, jsonData) {
  try {
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
  } catch (err) {}
}

async function concatJSON(filePath, jsonData) {
  try {
    let existingData = [];

    try {
      const data = await fs.readFile(filePath, "utf8");

      existingData = JSON.parse(data);
    } catch (err) {}

    const combinedData = { ...existingData, ...jsonData };

    await fs.writeFile(filePath, JSON.stringify(combinedData, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");

    const jsonData = JSON.parse(data);

    return jsonData;
  } catch (err) {
    console.log("JSON READ ERROR");
  }
}

module.exports = {
  fileExists,
  writeJson,
  readJSON,
  concatJSON,
};
