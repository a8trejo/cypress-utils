import HeroAppQuery from '../support/selectors/HeroAppQuery';

const baseURL = Cypress.env("HeroApp")
let testMeta = {}
const jiraProject = 'QE'

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
        // testMeta.testCaseId = 'QE-1233'
        cy.visit("/")
        // Define and Encode the authentication string
        const authString = `${Cypress.env("username")}:${Cypress.env("password")}`;
        const encodedAuth = Buffer.from(authString).toString('base64')
        const authorizedMsg = "Congratulations! You must have the proper credentials"

        // Preparing to intercept the /basic_auth request and add the auth header once we click on login
        cy.intercept('GET', '**/basic_auth', (req) => {
            req.headers['authorization'] = `Basic ${encodedAuth}`
        })
        HeroAppQuery.selectors('Basic Auth').click()
        HeroAppQuery.selectors("authorizedMsg").should('contain', authorizedMsg)
    })

    it("Reusing DOM elements in between multiple windows", () =>{
        cy.visit("/windows")

        // Saving an element as a promise to be used later on when it cannot be re-queried from the DOM
        const firstTextPromise = new Promise((resolve) => {
            HeroAppQuery.selectors("window1Text").then($value => {
                resolve($value.text().toLocaleLowerCase())
            })
        })
        
        // Moving to a new window, different DOM
        HeroAppQuery.selectors("window2Button").invoke("removeAttr", "target").click()
        HeroAppQuery.selectors("window2Text").then(($headerElement) => {
            const secondText = $headerElement.text().toLocaleLowerCase()

            // Accesing the promised element with cy.wrap
            cy.wrap(firstTextPromise).then((firstText) => {
                expect(firstText).to.include(secondText)
            })
        })
    })

    it("Preventing a form from submitting", () => {
        cy.visit("/key_presses")
        HeroAppQuery.selectors("inputBox").should("be.visible").and("be.enabled")
        
        // cy.get("form")
        HeroAppQuery.selectors("inputForm").then(form$ => {
            form$.on('submit', e => {
              e.preventDefault()
            })
        })

        // This {enter} by default submits the form, it wont after the above modification
        HeroAppQuery.selectors("inputBox").type("{enter}")
        HeroAppQuery.selectors("temporalMsg").should('contain', "You entered: ENTER")
    })

    it("Re-querying the DOM for an element", () => {
        cy.visit("/dynamic_controls")
        HeroAppQuery.selectors("toggleButton").should('be.enabled').and('contain', "Remove")
        .click()
        HeroAppQuery.selectors("loadingBar").should('be.visible')
        // 'should' assertion re-queries the DOM such as cy.get("#message", { timeout: 15000 }).should('be.visible')
        HeroAppQuery.selectors("toggleMsg").should('be.visible')
    })

    it("Horizontal Slider Value Range", () => {
        cy.visit("/horizontal_slider")

        HeroAppQuery.selectors("slideBar").invoke('val', 3).trigger('change')
        HeroAppQuery.selectors("slideValue").should('contain', 3)
    })

    it("Jquery UI and Download File", () => {
        cy.visit("/jqueryui/menu")

        HeroAppQuery.selectors("enabledMenu").click()
        HeroAppQuery.selectors("downloadsMenu").click()

        HeroAppQuery.selectors("pdfDownload").invoke('attr', 'href').then((downloadUrl) => {
            HeroAppQuery.selectors("pdfDownload").invoke('removeAttr', 'href').click({force: true})
            cy.api({url: downloadUrl,})
        })
    })


    it("Single Iframe", () => {
        cy.visit("/iframe")
        const iframeText = "------------------YESSSSSSS------------------"

        // Under the hood runs the following chain of commands with a cy.wrap at the end
        // return cy.get("iframe#mce_0_ifr").its('0.contentDocument.body').should('not.be.empty').then(cy.wrap)
        HeroAppQuery.selectors("iframeInput").should('be.visible').and('contain', "Your content goes here")
            .clear().type(iframeText)
        // This specific iframe allows directly typing into the body as it is a MCE WYSIWYG Editor

        HeroAppQuery.selectors("iframeInput").should('contain', iframeText)

        // Used https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/ as guide
    })

    it("Custom error msg on assertions", () => {
        cy.visit("/horizontal_slider")
        const succesMsg = "The Slider was moved succesfully!"

        HeroAppQuery.selectors("slideBar").type("3")

        // Binding to this event without rethrowing the error will prevent the test from failing
        Cypress.on('fail', (error, runnable) => {
        })
            
        HeroAppQuery.selectors("slideValue").should(($e) => {
            const sliderValue = $e.text()
            assert.isTrue(sliderValue==="3", succesMsg)
        })
    })
})