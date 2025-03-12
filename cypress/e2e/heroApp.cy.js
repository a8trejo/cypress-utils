import HeroAppQuery from '../support/selectors/HeroAppQuery';

const baseURL = Cypress.env("HeroApp")
const jiraProject = Cypress.env("jiraProjectKey")
let testMeta = {}

const heroAppPage = new HeroAppQuery()

before(() =>{
    Cypress.config('baseUrl', baseURL)
})

beforeEach(function () {
    testMeta = {}
    testMeta.jiraProjectKey = jiraProject

});

afterEach( function() {
    testMeta.state = this.currentTest.state
    testMeta.tags = this.currentTest._testConfig.unverifiedTestConfig.tags
    cy.printTestMeta(testMeta, Cypress.currentTest)
});

describe("Hero App Web Automation", () => {
    it("Basic Auth promt", { tags: ['@smoke'] }, () => {
        testMeta.testSummary = "Testing a basic authorization prompt by intercepting the /basic_auth endpoint and providing an auth header to it"
        testMeta.testedIds = ['QE-1']
        // If the test ID does not exists, python script will create it in Jira
        // testMeta.testCaseId = 'QE-1233' 

        cy.visit("/")
        // Define and Encode the authentication string
        const authString = `${Cypress.env("username")}:${Cypress.env("password")}`;
        const encodedAuth = Buffer.from(authString).toString('base64')
        const authorizedMsg = "Congratulations! You must have the proper credentials"

        // Preparing to intercept the /basic_auth request and add the auth header once we click on login
        cy.intercept('GET', '**/basic_auth', (req) => {
            req.headers['authorization'] = `Basic ${encodedAuth}`
        }).as('basicAuth')
        heroAppPage.basicAuth().click()
        heroAppPage.authorizedMsg().should('contain', authorizedMsg)
    })

    it("Reusing DOM elements in between multiple windows", () =>{
        cy.visit("/windows")

        // Saving an element as a promise to be used later on when it cannot be re-queried from the DOM
        const firstTextPromise = new Promise((resolve) => {
            heroAppPage.window1Text().then($value => {
                resolve($value.text().toLocaleLowerCase())
            })
        })
        
        // Moving to a new window, different DOM
        heroAppPage.window2Button().invoke("removeAttr", "target").click()
        heroAppPage.window2Text().then(($headerElement) => {
            const secondText = $headerElement.text().toLocaleLowerCase()

            // Accesing the promised element with cy.wrap
            cy.wrap(firstTextPromise).then((firstText) => {
                expect(firstText).to.include(secondText)
            })
        })
    })

    it("Preventing a form from submitting", () => {
        cy.visit("/key_presses")
        heroAppPage.inputBox().should("be.visible").and("be.enabled")
        
        // cy.get("form")
        heroAppPage.inputForm().then(form$ => {
            form$.on('submit', e => {
              e.preventDefault()
            })
        })

        // This {enter} by default submits the form, it wont after the above modification
        heroAppPage.inputBox().type("{enter}")
        heroAppPage.temporalMsg().should('contain', "You entered: ENTER")
    })

    it("Re-querying the DOM for an element", () => {
        cy.visit("/dynamic_controls")
        heroAppPage.toggleButton().should('be.enabled').and('contain', "Remove")
        .click()
        heroAppPage.loadingBar().should('be.visible')
        // 'should' assertion re-queries the DOM such as cy.get("#message", { timeout: 15000 }).should('be.visible')
        heroAppPage.toggleMsg().should('be.visible')
    })

    it("Horizontal Slider Value Range", () => {
        cy.visit("/horizontal_slider")

        heroAppPage.slideBar().invoke('val', 3).trigger('change')
        heroAppPage.slideValue().should('contain', 3)
    })

    it("Jquery UI and Download File", () => {
        cy.visit("/jqueryui/menu")

        heroAppPage.enabledMenu().click()
        heroAppPage.downloadsMenu().click()

        heroAppPage.pdfDownload().invoke('attr', 'href').then((downloadUrl) => {
            heroAppPage.pdfDownload().invoke('removeAttr', 'href').click({force: true})
            cy.api({url: downloadUrl,})
        })
    })


    it("Single Iframe", () => {
        cy.visit("/iframe")
        // const iframeText = "------------------YESSSSSSS------------------"

        // Under the hood runs the following chain of commands with a cy.wrap at the end
        // return cy.get("iframe#mce_0_ifr").its('0.contentDocument.body').should('not.be.empty').then(cy.wrap)
        heroAppPage.iframeInput().should('be.visible').and('contain', "Your content goes here")
        heroAppPage.dismissCallout().click()
        // heroAppPage.iframeInput().clear().type(iframeText)
        // This specific iframe allows directly typing into the body as it is a MCE WYSIWYG Editor

        // heroAppPage.iframeInput().should('contain', iframeText)

        // Used https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/ as guide
    })

    it("Custom error msg on assertions", () => {
        cy.visit("/horizontal_slider")
        const succesMsg = "The Slider was moved succesfully!"

        heroAppPage.slideBar().type("3")

        // Binding to this event without rethrowing the error will prevent the test from failing
        Cypress.on('fail', (error, runnable) => {
        })
            
        heroAppPage.slideValue().should(($e) => {
            const sliderValue = $e.text()
            assert.isTrue(sliderValue==="3", succesMsg)
        })
    })
})