import minimist from "minimist";
import _ from "lodash";
import {
  transformToJson,
  writeJson,
  extractFromJsonFile,
  transformToDynamoDBPutRequests,
} from "./runner.js";
import {
  extractFromDynamoDB,
  writeToDynamoDB,
  init,
} from "./dynamodb-client.js";

var argv = minimist(process.argv.slice(2));

let defaultConfig = {
  table: "",
  profile: null,
  dryrun: false,
  file: "",
};

let config = _.assign(
  {},
  defaultConfig,
  _.pick(argv, ["table", "profile", "file", "dryrun", "writeCapacity"])
);
console.log("Configuration is ", config);
if (config.table === "") {
  throw new Error("You must supply a dynamodb table name in the arguments");
}
if (config.file === "") {
  throw new Error("You must supply a file name in the arguments");
}

async function dynamoDBtoJson() {
  try {
    let listOfResults = await extractFromDynamoDB(config.table);
    let parsed = transformToJson(listOfResults);
    let output = writeJson(parsed, config.file, config.dryrun);
    return output;
  } catch (error) {
    console.error(error);
  }
}

async function jsonToDynamoDB() {
  let jsonData = extractFromJsonFile(config.file);
  let chunkedPutRequests = transformToDynamoDBPutRequests(
    jsonData,
    config.writeCapacity
  );
  let result = await writeToDynamoDB(
    chunkedPutRequests,
    config.table,
    config.dryrun
  );
  return result;
}

init(config);
if (argv.fromTableToJson) {
  (async function () {
    dynamoDBtoJson();
  })();
}
if (argv.fromJsonToTable) {
  (async function () {
    jsonToDynamoDB();
  })();
}
