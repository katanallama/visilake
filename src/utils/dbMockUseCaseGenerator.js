const fs = require('fs');
const path = require('path');

const NUM_OF_ITEMS = 25;

function generateMockUseCases(count, outputFilePath) {
  const mockRequests = [];

  const availableAnalysisTypes = ["Rolling Mean", "Rolling Std Deviation", "Autocorrelation"];

  for (let i = 1; i <= count; i++) {
    const input = {
      useCaseName: `Use case ${i}`,
      useCaseDescription: `This is a test for use case ${i}`,
      analysisTypeNames: getRandomAnalysisTypes(availableAnalysisTypes)
    };

    const dynamodbParams = {
      PutRequest: {
        Item: {
          requestID: { S: i.toString() },
          id: { S: getRandomId() },
          creationDate: { N: getRandomDate().toString() },
          useCaseStatus: { S: getRandomStatus() },
          useCaseName: { S: input.useCaseName },
          useCaseDescription: { S: input.useCaseDescription },
          author: { S: getRandomAuthor() },
          analysisTypes: {
            L: input.analysisTypeNames.map((id) => ({ S: id.toString() })),
          },
          powerBILink: {
            S: "https://app.powerbi.com/groups/me/reports/{ReportId}/ReportSection?filter=TableName/FieldName eq 'value'",
          },
        },
      },
    };

    const mockRequest = {
      PutRequest: dynamodbParams.PutRequest,
    };

    mockRequests.push(mockRequest);
  }

  const outputData = { mockRequests };

  // Convert the object to a JSON string
  const jsonString = JSON.stringify(outputData, null, 2);

  // Write the JSON string to a file
  fs.writeFileSync(outputFilePath, jsonString, 'utf-8');
}

function getRandomId() {
  const timestamp = new Date().getTime().toString(36);
  const randomChars = Math.random().toString(36).substr(2, 5);
  return timestamp + randomChars;
}

function getRandomAnalysisTypes(availableTypes) {
    const numberOfTypes = Math.floor(Math.random() * availableTypes.length) + 1;
    const shuffledTypes = availableTypes.sort(() => Math.random() - 0.5);
    return shuffledTypes.slice(0, numberOfTypes);
}

function getRandomStatus() {
  const statusOptions = ["Complete", "InProgress", "NotStarted", "Failed"];
  const randomIndex = Math.floor(Math.random() * statusOptions.length);
  return statusOptions[randomIndex];
}

function getRandomDate() {
  const startMillis = new Date(2023, 8, 1).getTime();
  const endMillis = new Date(2024, 1, 15).getTime();
  return Math.floor(startMillis + Math.random() * (endMillis - startMillis));
}

function getRandomAuthor() {
  const mockAuthorNames = [
    "Emily Johnson",
    "James Mitchell",
    "Sophia Turner",
    "Benjamin Hayes",
    "Olivia Bennett"
  ];
  return mockAuthorNames[Math.floor(Math.random() * mockAuthorNames.length)] ?? "Jane Doe";
}

const mockDataDirectory = path.resolve(__dirname, '../../infra/useCases/');
const outputFilePath = path.join(mockDataDirectory, 'mockUseCasesBatchCommand.json');
generateMockUseCases(NUM_OF_ITEMS, outputFilePath);