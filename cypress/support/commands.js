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
import { prettyPrintJson } from 'pretty-print-json';
import { ApiLogLvl } from '../support/e2e'


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

Cypress.Commands.add('objectToDOM', (object) => { 
    let newElement = window.document.createElement('pre')
    newElement.style.fontSize = "medium";
    newElement.style.fontWeight = '650'
    newElement.style.overflow = 'auto'

    //newElement.innerText = JSON.stringify(object, null, 2)
    const printOptions = {indent: 2, lineNumbers: false, quoteKeys: true}
    newElement.innerHTML = prettyPrintJson.toHtml(object, printOptions)
    
    cy.get('body').then((testRunner) => {
        testRunner.get(0).prepend(newElement)
    })
})

/**
 * API call to Github
 *
 * @param options
 * @param apiDOM - if true, the call is made with cy.api, if false, with cy.request
 */
Cypress.Commands.add('apiGithub', (options, apiDOM = ApiLogLvl.REQUEST) => {
  const apiOptions = {
      ...options,
      ...{
          url: Cypress.env('githubApi') + options.url,
          headers: {
              'Accept': "application/vnd.github+json",
              'X-GitHub-Api-Version': "2022-11-28",
              "Authorization": `Bearer ${Cypress.env('GITHUB_TOKEN')}`,
              ...options.headers,
          },
          failOnStatusCode: false,
      },
  }

  if (apiDOM) {
      cy.api(apiOptions).then(response => {
          return response
      })
  } else {
      cy.request(apiOptions).then(response => {
          return response
      })
  }
})

Cypress.Commands.add(
    'waitForLatestIntercept',
    (alias,options) => {
        const {
            failOnStatusCode = false,
            timeout = Cypress.config('responseTimeout'),
            assertAwaited = false,
            verbose = false,
        } = options ?? {}
        const aliasSuffix = alias.replace('@', '')

        const assertOnStatusCode = (statusCode) => {
            if (failOnStatusCode) {
                // A 304 Not Modified status should be considered due to responses cached routes (no need to retransmit the requested resources)
                const isSuccess = (statusCode >= 200 && statusCode <= 299) || statusCode === 304
                const assertMessage = isSuccess
                    ? `'${alias}' :: Response has a successful status code ${statusCode}`
                    : `'${alias}' :: Response has a failed status code ${statusCode}`
                if (verbose) {
                    assert.isTrue(isSuccess, assertMessage)
                } else if (!isSuccess) {
                    throw new Error(assertMessage)
                }
            }
        }

        // Reference: https://glebbahmutov.com/blog/get-all-network-calls/
        return cy.get(`${alias}.all`, { log: false }).then(interceptions => {
            // Each intercept has a responseWaited property that changes on each cy.wait('alias') command
            if (interceptions.length > 1) {
                cy.log(`**waitForLatestIntercept** :: **${alias}(${interceptions.length})** `)
                return cy
                    .get(`${alias}.all`, { log: verbose })
                    .each((interception, index, $list) => {
                        const latestIndex = $list.length - 1
                        if (!interception.responseWaited) {
                            // Change to log false after testing entire suite
                            cy.wait(alias, { timeout: timeout, log: verbose })
                            cy.get(`${alias}.all`, { timeout: timeout, log: false })
                                .its(index, { log: false })
                                .should(interception => {
                                    if (assertAwaited) {
                                        if (!interception.responseWaited) {
                                            throw new Error(`${alias} index: ${index} should be responseWaited`)
                                        }

                                        if (interception.state != 'Complete') {
                                            throw new Error(
                                                `${alias} index: ${index} should be Complete but was ${interception.state}`
                                            )
                                        }
                                    }
                                    const statusCode = interception.response?.statusCode ?? 0
                                    assertOnStatusCode(statusCode)
                                })
                        }

                        if (index + 1 === $list.length) {
                            // Set alias for the latest waited interception
                            cy.get(`${alias}.all`, { timeout: timeout, log: false })
                                .its(latestIndex, { log: false })
                                .as(`${aliasSuffix}Latest`)
                        }
                    })
                    .then(() => {
                        // Return the latest waited index, (total might have increased)
                        return cy.get(`${alias}Latest`, { log: false })
                    })
            } else {
                // Regular wait for single request
                return cy.wait(alias, { timeout: timeout }).then(interception => {
                    const statusCode = interception.response?.statusCode ?? 0
                    assertOnStatusCode(statusCode)
                    return interception
                })
            }
        })
    }
)

Cypress.Commands.add('waitForNetworkIdle', (idleTimeout, idleRetryTimeout) => {
    // Giving extra time to the task to avoid race conditions
    const puppeteerTimeout = Cypress.expose('networkIdleRetryTimeout') + Cypress.expose('networkIdleTimeout')
    const originalTimeout = Cypress.config('taskTimeout')
    Cypress.config('taskTimeout', puppeteerTimeout)

    cy.puppeteer('waitForNetworkIdle', idleTimeout, idleRetryTimeout)

    Cypress.config('taskTimeout', originalTimeout)
})