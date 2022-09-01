/// <reference types="cypress" />

class HeroAppQuery {
    static selectors (webElement) {
        switch (webElement) {
            case "Basic Auth": return cy.get("li>a").contains("Basic Auth")
            case "window1Text": return cy.get(".example h3")
            case "window2Button": return cy.get(".example a")
            case "window2Text": return cy.get(".example h3")
        }
    }
}

export default HeroAppQuery;
