type Interception = import('cypress/types/net-stubbing').Interception

/**
 * Type extension for Mocha.Test to include Cypress/grep internal properties.
 * Based on @cypress/grep package's tag functionality.
 */
interface CypressTestWithTags extends Mocha.Test {
    _testConfig?: {
        unverifiedTestConfig?: {
            tags?: string[]
        }
    }
}

declare namespace Cypress {
    interface TestConfigOverrides {
        testIndex?: number
    }

    interface Chainable {
        /**
         * Basic Authentication pop up for the landing page
         * @param user: Username
         * @param pass:  Password
         * @example cy.loginCookies()
         */
        loginToAuthPopup(user: string, pass: string): Cypress.Chainable<any>

        /**
         * Logger Utility, can send a msg to the 'node' console, 'browser' console, 'cy' test runner or all
         * @param logMsg: String, object, or array of strings/objects to log
         * @param logConsole: Into which console/s to print messages. If not specified, logMsg is printed in all consoles
         * @example cy.logger('Hello Console')
         * @example cy.logger(['Response: ', interception])
         * @example cy.logger({ key: 'value' })
         */
        logger(
            logMsg: any | any[],
            logConsole?: {
                nodeConsole?: boolean
                runnerConsole?: boolean
                browserConsole?: boolean
            }
        ): Cypress.Chainable<any>

        /**
         * Custom command to upload a file as Drag & Drop
         * @param filePath: Relative path to the file
         * @example cy.get("css selector").dragDropFile('path/to/photo')
         */
        dragDropFile(filePath: string): Cypress.Chainable<any>

        /**
         * Custom contains command but matching the exact substring
         * @example cy.get("[type='checkbox']").containsMatch("1")
         */
        containsMatch(exactMatch: string): Cypress.Chainable<any>

        /**
         * Scrolls an element underneath the Roo NavBar Header
         * @param options: Same parameters as cy.scrollIntoView()
         * @example cy.get("[type='checkbox']").rooScroll()
         */
        rooScroll(options?: Partial<Cypress.ScrollIntoViewOptions>): Cypress.Chainable<any>

        /**
         * Scrolls into an element using the element's bounding client rect
         * @param options: Same parameters as cy.scrollTo() plus optional offset
         * @example cy.get("[type='checkbox']").scroll2Element()
         * @example cy.get("[type='checkbox']").scroll2Element({ offset: { top: -150, left: 0 } })
         */
        scroll2Element(
            options?: Partial<Cypress.ScrollToOptions> & { offset?: { top: number; left: number } }
        ): Cypress.Chainable<any>

        /**
         * Moves a slider element into a random value
         * @example cy.get("[data-testid='drivenSlider'] .rc-slider-handle").slideIntoRandom()
         */
        slideIntoRandom(): Cypress.Chainable<any>

        /**
         * Moves a slider element into a random value
         * @param property: CSS Property to validate
         * @param expectedValue: Expected Value of the CSS propert
         * @example cy.get("div.aaha-logo").shouldContainCSS('background', 'url')
         */
        shouldContainCSS(property: string, expectedValue: string): Cypress.Chainable<any>

        /**
         * Reads an asserts the CSS property "content" on a ::before{}"
         * @param expectedValue: Expected Value of the CSS propert
         * @example cy.get(".text-danger message-incomplete").shouldContainCssContent('Please complete all required fields')
         */
        shouldContainCssContent(expectedValue: string): Cypress.Chainable<any>

        /**
         * Moves a slider element into a random value
         * @param expectedValue: Expected Size Value ()
         * @example cy.get("div.aaha-logo").shouldContainCSS('background', 'url')
         */
        shouldHaveSize(expectedValue: number): Cypress.Chainable<any>

        /**
         * Custom command to scrollinto view and then click on a given option of a React Select element
         * @param option: Element of the list within the react select options
         * @example cy.get("[data-testid='shiftFrequencyList'] + div [tabindex]").clickSelect("Mostly wellness")
         */
        clickSelect(option: string): Cypress.Chainable<any>

        /**
         * Utility to print an object into the DOM for debugging
         * @example cy.objectToDOM(jsonObject)
         */
        objectToDOM(logMsg: string | undefined, logConsole?: string): Cypress.Chainable<any>

        /**
         * Custom Command to monitor the browser's console log for a specigic msg, it MUST have a spy before hand
         * @param alias: log alias
         * @example cy.spyConsoleLog('log') which performs -> cy.window().its('console').then((console) => { cy.spy(console, 'log').as('consoleLog') })
         * // Do something that triggers the console log you want to wait for
         * cy.waitForConsoleMsg('socket LEAVING room')
         */
        spyConsoleLog(alias?: string): Cypress.Chainable<any>

        /**
         * Monitors the browser's console log for a specigic msg, MUST have a spy before hand
         * @param expectedLog: expected msg
         * @param logAlias: log alias
         * @example cy.window().its('console').then((console) => { cy.spy(console, 'log').as('consoleLog') })
         * // Do something that triggers the console log you want to wait for
         * cy.waitForConsoleMsg('socket LEAVING room')
         */
        waitForConsoleMsg(expectedLog: string, logAlias?: string): Cypress.Chainable<any>

        /**
         * Command to wait for a file to be downloaded
         * @param filePath: Payload
         * @param bitsSize: Payload
         * @example cy.waitForDownload(filePath)
         */
        waitForDownload(filePath: string, bitsSize: number): Cypress.Chainable<any>

        /**
         * Command to check/toggle an element ON if it's OFF
         * @example cy.forceToggleOn().then((response) => { })
         */
        forceToggleOn(): Cypress.Chainable<any>

        /**
         * cy.task('setSpecAttempts') to set the global test attempt as a variable in Node.js
         * @param event: 'setSpecAttempts'
         * @param specAttempts: The AuthSession object of the respective user
         * @param options: Same parameters as a regular cy.task()
         * @example cy.task('setSpecAttempts', specAttempts, { log: false })
         */
        task(
            event: 'setSpecAttempts',
            specAttempts: number,
            options?: Partial<Cypress.Loggable & Cypress.Timeoutable> | undefined
        ): Cypress.Chainable<any>

        /**
         * cy.task('getAfterSpecAttempts') to get the current global test attempt from a variable in Node.js
         * @param event: 'getAfterSpecAttempts'
         * @param options: Same parameters as a regular cy.task()
         * @example cy.task('getAfterSpecAttempts', { log: false }).then((specAttempts) => {})
         */
        task(
            event: 'getAfterSpecAttempts',
            options?: Partial<Cypress.Loggable & Cypress.Timeoutable> | undefined
        ): Cypress.Chainable<number>
        /**
         * cy.task('setAfterSpecAttempts') to set the global test attempt as a variable in Node.js
         * @param event: 'setAfterSpecAttempts'
         * @param specAttempts: The AuthSession object of the respective user
         * @param options: Same parameters as a regular cy.task()
         * @example cy.task('setAfterSpecAttempts', specAttempts, { log: false })
         */
        task(
            event: 'setAfterSpecAttempts',
            specAttempts: number,
            options?: Partial<Cypress.Loggable & Cypress.Timeoutable> | undefined
        ): Cypress.Chainable<any>

        /**
         * cy.task('getSpecAttempts') to get the current global test attempt from a variable in Node.js
         * @param event: 'getSpecAttempts'
         * @param options: Same parameters as a regular cy.task()
         * @example cy.task('getSpecAttempts', { log: false }).then((specAttempts) => {})
         */
        task(
            event: 'getSpecAttempts',
            options?: Partial<Cypress.Loggable & Cypress.Timeoutable> | undefined
        ): Cypress.Chainable<number>

        /**
         * Maps test coverage data to a coverage map file, showing which tests execute which files.
         *
         * @param specFile The spec file path (e.g. 'cypress/src/specs/users/tech-request-shifts.cy.ts')
         * @param testTitle The test title (e.g. 'should request shift successfully')
         * @param coverageObject Coverage data from window.__coverage__ (React) or /__coverage__ endpoint (Node)
         * @param isReactCoverage Whether this is React coverage (true) or Node coverage (false). Defaults to true.
         *
         * For React coverage (window.__coverage__):
         * - Sums up all statement execution counts
         * - File is considered covered if total count > 0
         * - Writes to coverage-map.json
         *
         * For Node coverage (/__coverage__):
         * - Checks if any statement has been executed at least once
         * - File is considered covered if any statement count > 0
         * - Logs coverage stats for debugging
         * - Writes to node-coverage-map.json
         */
        mapCoverage(
            specFile: string,
            testTitle: string,
            coverageObject: any,
            isReactCoverage?: boolean
        ): Cypress.Chainable<any>

        /**
         * Command to take a chromatic snapshot
         * @param snapshotName: snapshotName
         * @example cy.takeSnapshot(snapshotName)
         */
        takeSnapshot(snapshotName?: string): Cypress.Chainable<any>

        /**
         * Custom command to clear an input field with backspaces
         * @param options: Options for Element to clear
         * @example cy.get("[data-testid='input']").realClear()
         */
        realClear(options?: { delay?: number; log?: boolean }): Cypress.Chainable<any>

        /**
         * Waits for intercepted request(s) to complete. If multiple requests share the same alias, waits for the last one.
         * Optionally validates 2xx status code.
         * @param alias - Request alias from cy.intercept().as('alias'), example: '@getTasks' (notice the @ prefix)
         * @param options - Configuration options
         * @param options.timeout - Max wait time (default: Cypress defaultCommandTimeout)
         * @param options.failOnStatusCode - Assert 2xx status code (default: true)
         * @param options.assertAwaited - Assert the interception 'responseWaited' property
         * @param options.verbose - Wether to log all the details of the command or not
         * @example cy.waitForLatestIntercept('@getTasks')
         * @example cy.waitForLatestIntercept('@createTask', { timeout: 5000, failOnStatusCode: false })
         */
        waitForLatestIntercept(
            alias: `@${string}`,
            options?: { timeout?: number; failOnStatusCode?: boolean; assertAwaited?: boolean; verbose?: boolean }
        ): Cypress.Chainable<Interception>

        /**
         * Custom Command to stub the window.open method to open a new tab with the _self target
         * @param targetType: target of the window.open method
         * @param alias: alias of the stub
         * @example cy.windowOpenSelf('_blank', 'open')
         */
        windowOpenSelf(targetType: string, alias: string): Cypress.Chainable<any>

        /**
         * Custom Command to use cy.puppeteer('waitForNetworkIdle') with custom task timeout
         * @param idleTimeout: timeout of the wait
         * @param idleRetryTimeout: timeout of the retry
         * @example cy.waitForNetworkIdle()
         */
        waitForNetworkIdle(idleTimeout?: number, idleRetryTimeout?: number): Cypress.Chainable<any>

        /**
         * Custom command to stub Location wrapper methods for testing
         * @param method: The Location method to stub ('href', 'assign', 'replace')
         * @param alias: The alias to use for the stub
         * @example cy.stubLocationMethod('href', 'locationHref')
         */
        stubLocationMethod(method: string, alias: string): Cypress.Chainable<any>

        /**
         * Custom command to stub navigator.clipboard.writeText for testing
         * @param alias: The alias to use for the stub
         * @example cy.stubClipboard('clipboard')
         */
        stubClipboard(alias: string): Cypress.Chainable<any>

        /**
         * cy.task('deleteFile') to delete a file using fs
         * @param event: 'deleteFile'
         * @param filePath: Path of file to delete
         * @param options: Same parameters as a regular cy.task()
         * @example cy.task('deleteFile', 'cypress/results/file.json', { log: false })
         */
        task(
            event: 'deleteFile',
            filePath: string,
            options?: Partial<Cypress.Loggable & Cypress.Timeoutable> | undefined
        ): Cypress.Chainable<number>

        /**
         * cy.task('deleteFolder', 'results/screenshots') to delete a specified folder path
         * @param event: 'deleteFolder'
         * @param options: Same parameters as a regular cy.task()
         * @example cy.task('deleteFolder', 'results/screenshots', { log: false })
         */
        task(
            event: 'deleteFolder',
            folderPath: string,
            options?: Partial<Cypress.Loggable & Cypress.Timeoutable> | undefined
        ): Cypress.Chainable<number>

        /**
         * Custom Command to use cy.puppeteer('waitForNetworkIdle') with custom task timeout
         * @param timeFormat: String with time format
         * @example cy.getTimeStamp('M/DD/YYYY, h:mm:ss A')
         */
        getTimeStamp(timeFormat: string): any

        /**
         * API call to Github
         * @param options: Request options (url, method, body, headers, etc.)
         * @param apiDOM: if true, the call is made with cy.api, if false, with cy.request
         * @example cy.apiGithub({ url: '/repos/owner/repo', method: 'GET' })
         */
        apiGithub(options: Partial<Cypress.RequestOptions>, apiDOM?: boolean): Cypress.Chainable<Cypress.Response<any>>
    }
}
