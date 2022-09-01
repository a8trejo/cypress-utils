const baseURL = Cypress.env("HeroApp")
import HeroAppQuery from '../support/selectors/HeroAppQuery';

before(() =>{
    cy.visit(baseURL)
})

describe("Hero App Web Automation", () => {
    it("Basic auth promt", () => {
        HeroAppQuery.selectors('Basic Auth').click()
    })
})