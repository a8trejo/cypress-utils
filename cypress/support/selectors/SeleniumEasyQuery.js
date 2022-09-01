/// <reference types="cypress" />

class SeleniumEasyQuery {
    static selectors (webElement) {
        switch (webElement) {
            case 'homePromptClose': return cy.get('#at-cv-lightbox-close')
            case 'Alerts & Modals': return cy.get('.tree-branch ul .tree-branch').contains(webElement)
            case 'Javascript Alerts': return cy.get(".tree-branch ul .tree-branch li[style='display: list-item;']").contains(webElement)
            case 'Promt': return cy.get("button.btn-default.btn-lg").contains("Prompt Box")
        }
    }
}

export default SeleniumEasyQuery;
