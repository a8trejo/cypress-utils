const baseURL = Cypress.env("HeroApp")
import HeroAppQuery from '../support/selectors/HeroAppQuery';

before(() =>{
    Cypress.config('baseUrl', baseURL)
    cy.visit("/")
})

describe("Hero App Web Automation", () => {
    it("Basic Auth promt", () => {
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
        HeroAppQuery.selectors("slideBar").should('have.value', 3)
    })

    it("Jquery UI & Download File", () => {
        cy.visit("/jqueryui/menu")

        HeroAppQuery.selectors("enabledMenu").click()
        HeroAppQuery.selectors("downloadsMenu").click()

        HeroAppQuery.selectors("pdfDownload").invoke('attr', 'href').then((downloadUrl) => {
            HeroAppQuery.selectors("pdfDownload").invoke('removeAttr', 'href').click({force: true})
            cy.api({url: downloadUrl,})
        })
    })
})