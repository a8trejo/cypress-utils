// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('logMsg', (logMsg) => {
    cy.task('logMsg', logMsg)
    cy.log(logMsg);
});

Cypress.Commands.add('getTimeStamp', timeFormat => {
    //Ex: cy.getTimeStamp('M/DD/YYYY, h:mm:ss A')
    return new Cypress.Promise((resolve, reject) => {
        let timeStamp = dayjs().format(timeFormat);
        resolve(timeStamp);
    });
});

Cypress.Commands.add('printTestMeta', (testMeta, testObject) => {
    const metaFile = Cypress.env("metaDataPath")
    const metaData = {...testObject, ...testMeta}
    let testInfoArray = []
    let retriedTest = false
  
    cy.task('readJsonMaybe', metaFile).then((fileObj) => {
      
      // If the metadata report does not exists
      if (typeof fileObj.testInfo === 'undefined') {
        // testInfo argument will be an array containing all of the tests info as a json object
        fileObj.testInfo = []
      }
  
      // Empty array OR all the info of the metadata report
      testInfoArray = [...fileObj.testInfo]
      
      testInfoArray.forEach((test, index) => {
        if (test.title === metaData.title) {
          retriedTest = true
          metaData.retried = retriedTest
          testInfoArray[index] = metaData
        }
      })
      if (retriedTest === false){
        testInfoArray.push(metaData)
      }
  
      // Updating the file object
      fileObj.testInfo = testInfoArray
      cy.writeFile(metaFile, fileObj)
    })
  });