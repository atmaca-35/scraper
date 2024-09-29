const fileOpts = require("./file_opts");

const fs = require("fs");

const path = require("path");

const statsDir = path.join(__dirname, "stats");

const csvDir = path.join(__dirname, "csv");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function processWords() {
  const content = {};

  try {
    const files = fs.readdirSync(statsDir);

    for (const file of files) {
      const filePath = path.join(statsDir, file);

      content[file] = await fileOpts.readJSON(filePath);
    }
  } catch (err) {
    console.log(err);
  }

  const wordCount = {};

  let totalWords = 0;

  for (const fileName in content) {
    const fileWordCount = {};
    let fileTotalWords = 0;

    for (const page in content[fileName]) {
      for (const entry of content[fileName][page]) {
        const words = entry.content.split(" ");

        if (words.length) {
          words.forEach((word) => {
            if (
              (word.length > 1 || word.toLowerCase() == "o") &&
              Number.isNaN(Number(word)) &&
              /^[a-zA-ZıİğĞçÇşŞöÖüÜ]+$/.test(word)
            ) {
              wordCount[word] = (wordCount[word] || 0) + 1;

              fileWordCount[word] = (fileWordCount[word] || 0) + 1;

              fileTotalWords += 1;
            }
          });

          totalWords += fileTotalWords;
        }
      }
    }

    const fileTable = convertToCSV(fileWordCount, fileTotalWords);

    await writeCSV(path.join(csvDir, fileName + ".csv"), fileTable);
  }

  const table = convertToCSV(wordCount, totalWords);

  await writeCSV(path.join(csvDir, "0all.csv"), table);
}

function convertToCSV(wordCount, totalWords) {
  const csvData = [];

  for (const [word, count] of Object.entries(wordCount)) {
    const percentage = ((count / totalWords) * 100).toFixed(4);
    csvData.push({ word, count, percentage });
  }

  const args = process.argv.slice(2);

  if (args.indexOf("order") >= 0) {
    csvData.sort((a, b) => b.count - a.count);
  } else {
    csvData.sort((a, b) => a.word.localeCompare(b.word));
  }

  return csvData;
}

async function writeCSV(filePath, table) {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "word", title: "Word" },
      { id: "count", title: "Count" },
      { id: "percentage", title: "Percentage" },
    ],
  });

  try {
    await csvWriter.writeRecords(table);
  } catch (error) {
    console.log(error);
  }
}

processWords().then(() => {
  console.log("CSV files are ready.");
});
