import SeleniumEasyQuery from '../support/selectors/SeleniumEasyQuery';
const baseURL = Cypress.env("SeleniumEasy")
const testFixtures = require('../fixtures/seleniumEasy.json')

before(() =>{
    Cypress.config('baseUrl', baseURL)
    // Login would usually happen here 
    // cy.visit("/")
})

describe("Selenium Easy Web Automation", () => {

    testFixtures["Form Data"].forEach((plot) => {
        it(`Dynamic Test Case Input Form: ${plot.title}`, () => {
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
})