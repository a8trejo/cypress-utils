/// <reference types="cypress" />

class HeroAppQuery {
    static selectors (webElement) {
        switch (webElement) {
            case "Basic Auth": return cy.get("li>a").contains("Basic Auth")
            case "authorizedMsg": return cy.get(".example p")
            case "window1Text": return cy.get(".example h3")
            case "window2Button": return cy.get(".example a")
            case "window2Text": return cy.get(".example h3")
            case "inputForm": return cy.get(".example form")
            case "inputBox": return cy.get("#target")
            case "temporalMsg": return cy.get("p#result")
            case "toggleButton": return cy.get("#checkbox + button")
            case "loadingBar": return cy.get("#loading")
            // Any timeout on a cy.get will be inherited by a 'should' when re-querying the DOM
            case "toggleMsg": return cy.get("#message", { timeout: 15000 })
            case "slideBar": return cy.get("input[type='range']")
            case "slideValue": return cy.get("#range")
        }
    }
}

export default HeroAppQuery;
