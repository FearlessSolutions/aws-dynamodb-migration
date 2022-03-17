import _ from "lodash";
import { writeFileSync, readFileSync } from "fs";

function writeJson(data, fileDestination, dryrun) {
  if (dryrun === "false") {
    console.log(
      `Would have written to file ${fileDestination} with data length ${data.length}`
    );
  } else {
    writeFileSync(fileDestination, JSON.stringify(data, 0, 4), "utf-8");
  }
}

function extractFromJsonFile(filename) {
  return JSON.parse(readFileSync(filename, "utf-8"));
}

function transformToDynamoDBPutRequests(jsonData, chunkSize = 1) {
  if (chunkSize > 25) {
    chunkSize = 25;
  }
  console.log(`writeToDynamoDB was given ${jsonData.length} items`);
  let chunks = _.chunk(jsonData, chunkSize);
  console.log(`which was divided into ${chunks.length} chunks of ${chunkSize}`);

  return chunks.map((chunk) => {
    let putRequests = chunk.map((item) => {
      return {
        PutRequest: {
          Item: item,
        },
      };
    });
    return putRequests;
  });
}

function transformToJson(listOfResults) {
  let result = listOfResults.map((item) => item.Items);
  var merged = [].concat.apply([], result);
  return merged;
}

const _extractFromJsonFile = extractFromJsonFile;
export { _extractFromJsonFile as extractFromJsonFile };
const _writeJson = writeJson;
export { _writeJson as writeJson };
const _transformToDynamoDBPutRequests = transformToDynamoDBPutRequests;
export { _transformToDynamoDBPutRequests as transformToDynamoDBPutRequests };
const _transformToJson = transformToJson;
export { _transformToJson as transformToJson };
