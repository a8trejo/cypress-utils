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

        // Preparing to intercept the /basic_auth request and add the auth header once we click on login
        cy.intercept('GET', '**/basic_auth', (req) => {
            req.headers['authorization'] = `Basic ${encodedAuth}`
        })
        HeroAppQuery.selectors('Basic Auth').click()
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
})