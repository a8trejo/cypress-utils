import SeleniumEasyQuery from '../support/selectors/SeleniumEasyQuery';

const baseURL = Cypress.env("SeleniumEasy")
const testFixtures = require('../fixtures/seleniumEasy.json')
const jiraProject = Cypress.env("jiraProjectKey")
let testMeta = {}

before(() =>{
    // Login would usually happen here 
    Cypress.config('baseUrl', baseURL)
})

beforeEach(function () {
    //Resetting the previous test metadata for the new test
    testMeta = {}
    testMeta.jiraProjectKey = jiraProject
});

// Not using arrow function to keep the inheritange of "this" as the test object
afterEach(function() {
    testMeta.state = this.currentTest.state
    const mochaTestTags = this.currentTest._testConfig.unverifiedTestConfig.tags

    if("tags" in testMeta && typeof(mochaTestTags) !== 'undefined') {
        testMeta.tags = [...testMeta.tags, ...mochaTestTags]
    } else if (!("tags" in testMeta) && typeof(mochaTestTags) !== 'undefined') {
        testMeta.tags = mochaTestTags
    }
    cy.printTestMeta(testMeta, Cypress.currentTest)
});

describe("Selenium Easy Web Automation", { browser: "electron" }, () => {

    testFixtures["Form Data"].forEach((plot) => {
        it(`Dynamic Test Case Input Form: ${plot.title}`, () => {
            if("tags" in plot) {
                testMeta.tags = plot.tags
            }
            cy.visit('/input-form-demo.html')
            SeleniumEasyQuery.selectors('firstNameInput').should('be.visible').and('be.enabled')
            .type(plot.arguments.firstName)
            SeleniumEasyQuery.selectors('lastNameInput').type(plot.arguments.lastName)
            SeleniumEasyQuery.selectors('emailInput').type(plot.arguments.email)
            SeleniumEasyQuery.selectors('cityInput').type(plot.arguments.city)
            SeleniumEasyQuery.selectors('stateInput').select(plot.arguments.state)

            const hostingBoolean = (plot.arguments.hosting) ? "hostingTrue":"hostingFalse"
            SeleniumEasyQuery.selectors(hostingBoolean).click()

            SeleniumEasyQuery.selectors('projectInput').type(plot.arguments.projectDescription)
            SeleniumEasyQuery.selectors('sendButton').click()
        })
    })

    it("Drag and Drop Events", () => {
        cy.visit("/drag-and-drop-demo.html")

        // MUST access the `dataTransfer` property from the `drop` event which
        // holds the files dropped into the browser window.
        const dataTransfer = new DataTransfer();
        
        SeleniumEasyQuery.selectors('firstDrag').should("be.visible").then(($dragBox) => {
            const boxText = $dragBox.text()
            cy.wrap($dragBox).trigger('dragstart',{ dataTransfer });
            SeleniumEasyQuery.selectors('dropBox').trigger('drop',{ dataTransfer });
            SeleniumEasyQuery.selectors('droppedElements').should('contain', boxText)
        })
    })

    it("Multiple Origins", () => {
        // With "experimentalSessionAndOrigin: true" after every test, the current page is reset to about:blank
        const secondOrigin = Cypress.env("HeroApp")
        cy.visit("/")
        cy.origin(secondOrigin, () => {
            cy.visit('/')
            cy.get("#content h1").should('be.visible').and("contain", "Welcome")
        })

        // Selectors handling still far from ideal with cy.origin()
    })

    it("Connect to MySQL DB and execute query", () => {
        const sqlQuery = "SELECT * FROM wp_posts WHERE post_type='product';"
        cy.task('dbExec', {dbName: "wordpress-db", sql: sqlQuery}).then((sqlRows) => {
            cy.objectToDOM(sqlRows)
        })
    })
})