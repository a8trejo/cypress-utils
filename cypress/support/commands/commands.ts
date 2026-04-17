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
import { prettyPrintJson } from 'pretty-print-json'
import { ApiLogLvl } from '../plugins'
const dayjs = require('dayjs')
import 'cypress-file-upload'
// @ts-ignore - cypress-iframe doesn't have type definitions
import 'cypress-iframe'
import type { Interception } from 'cypress/types/net-stubbing'

Cypress.Commands.add(
    'logger',
    (
        logMsgs: any | any[],
        logLvl?: {
            nodeConsole?: boolean
            runnerConsole?: boolean
            browserConsole?: boolean
        }
    ) => {
        const { nodeConsole = true, runnerConsole = true, browserConsole = true } = logLvl ?? {}
        const isArray = Array.isArray(logMsgs)

        const stringify = (msg: any): string => {
            if (Array.isArray(msg)) {
                return msg
                    .map(item => (typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)))
                    .join('')
            }
            return typeof msg === 'object' ? JSON.stringify(msg, null, 2) : `${msg}`
        }

        const stringifiedMsg = stringify(logMsgs)
        if (nodeConsole) {
            cy.task('logMsg', stringifiedMsg)
        }
        if (runnerConsole) {
            cy.log(stringifiedMsg)
        }
        if (browserConsole) {
            console.log(...(isArray ? logMsgs : [logMsgs]))
        }
    }
)

Cypress.Commands.add('getTimeStamp', timeFormat => {
    //Ex: cy.getTimeStamp('M/DD/YYYY, h:mm:ss A')
    return new Cypress.Promise((resolve, reject) => {
        let timeStamp = dayjs().format(timeFormat)
        resolve(timeStamp)
    })
})

Cypress.Commands.add('objectToDOM', object => {
    let newElement = window.document.createElement('pre')
    newElement.style.fontSize = 'medium'
    newElement.style.fontWeight = '650'
    newElement.style.overflow = 'auto'

    //newElement.innerText = JSON.stringify(object, null, 2)
    const printOptions = { indent: 2, lineNumbers: false, quoteKeys: true }
    newElement.innerHTML = prettyPrintJson.toHtml(object, printOptions)

    cy.get('body').then(testRunner => {
        testRunner.get(0).prepend(newElement)
    })
})

Cypress.Commands.add(
    'waitForLatestIntercept',
    (
        alias: string,
        options?: { timeout?: number; failOnStatusCode?: boolean; assertAwaited?: boolean; verbose?: boolean }
    ) => {
        const {
            failOnStatusCode = true,
            timeout = Cypress.config('responseTimeout'),
            assertAwaited = true,
            verbose = false,
        } = options ?? {}
        const aliasSuffix = alias.replace('@', '')

        const assertOnStatusCode = (statusCode: number) => {
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
        return cy.get<Interception[]>(`${alias}.all`, { log: false }).then(interceptions => {
            // Each intercept has a responseWaited property that changes on each cy.wait('alias') command
            if (interceptions.length > 1) {
                cy.log(`**waitForLatestIntercept** :: **${alias}(${interceptions.length})** `)
                return cy
                    .get<Interception[]>(`${alias}.all`, { log: verbose })
                    .each((interception: Interception, index, $list) => {
                        const latestIndex = $list.length - 1
                        if (!interception.responseWaited) {
                            // Change to log false after testing entire suite
                            cy.wait(alias, { timeout: timeout, log: verbose })
                            cy.get<Interception[]>(`${alias}.all`, { timeout: timeout, log: false })
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
                            cy.get<Interception[]>(`${alias}.all`, { timeout: timeout, log: false })
                                .its(latestIndex, { log: false })
                                .as(`${aliasSuffix}Latest`)
                        }
                    })
                    .then(() => {
                        // Return the latest waited index, (total might have increased)
                        return cy.get<Interception>(`${alias}Latest`, { log: false })
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

// User auth for login pop up
Cypress.Commands.add('loginToAuthPopup', (user: string, pass: string) => {
    cy.visit('/login', {
        auth: {
            username: user,
            password: pass,
        },
    })
})

Cypress.Commands.add('dragDropFile', { prevSubject: true }, (subject, filePath) => {
    // 'subject' refers to the returned Chainable JQuery HTML promise from cy.get('selector'), hence a cy.wrap is needed
    cy.wrap(subject).attachFile(filePath, {
        subjectType: 'drag-n-drop',
    })
})

Cypress.Commands.add('windowOpenSelf', (targetType, alias) => {
    cy.window().then(win => {
        cy.stub(win, 'open')
            .callsFake((url, target) => {
                expect(target).to.eq(targetType)
                // Original `win.open` method but pass the `_self` argument
                // @ts-ignore
                return win.open.wrappedMethod.call(win, url, '_self')
            })
            // @ts-ignore @prettier-ignore
            .as(alias)
    })
})

// Reference: https://glebbahmutov.com/blog/spy-on-clipboard-copy/
Cypress.Commands.add('stubClipboard', (alias: string) => {
    // Get the application's window object
    // It should have our Location wrap object
    cy.window()
        .its('navigator.clipboard')
        .then(clipboard => {
            cy.stub(clipboard, 'writeText').as(alias)
        })
})

Cypress.Commands.add('realClear', { prevSubject: true }, (subject, options?: { delay?: number; log?: boolean }) => {
    const { delay = 50, log = true } = options ?? {}

    return cy.wrap(subject, { log: false }).then($e => {
        const selector = ($e as any).selector || 'unknown'
        if (log) cy.log(`realClear :: ${selector}`)

        const innerValue = `${$e.attr('value')}`
        if (innerValue !== '') {
            cy.wrap($e, { log: false }).click().focus({ log: false })

            // Use realType with backspace repeated for each character
            // This properly triggers React's onChange events
            return cy.wrap($e).realType('{backspace}'.repeat(innerValue.length), { delay, log: false })
        }
        return cy.wrap($e, { log: false })
    })
})
