## AWS - DynamoDB Migration Utility

This utility allows you to export data from an AWS DynamoDB table, and import the exported data to another table.

### Setup 
1) nvm install && nvm use

### Usage
* Export: Exports records from a DynamoDB table to a file
`npm run export <-- --table <table name> --file <path to file> [--dryrun] [--profile <profile name>]`

* Import: Imports records from a file to a DynamoDB table
`npm run import <-- --table <table name> --file <path to file> [--dryrun] [--writeCapacity <writeCapacity up to 25> ][--profile <profile name>]`

### Arguments
* table - The name of the table in DynamoDB
* file - The path & name of the file that either contains the records to import or where you want to export the records to
* dryrun - When set, the process does not create a file or update DynamoDB
* writeCapacity - The number of records to write in each batch. Defaults to 1, max of 25
* profile - The AWS profile to use for credentials