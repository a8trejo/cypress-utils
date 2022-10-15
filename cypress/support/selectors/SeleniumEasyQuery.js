/// <reference types="cypress" />

class SeleniumEasyQuery {
    static selectors (webElement) {
        switch (webElement) {
            case 'homePromptClose': return cy.get('#at-cv-lightbox-close')
            case 'Alerts & Modals': return cy.get('.tree-branch ul .tree-branch').contains(webElement)
            case 'Javascript Alerts': return cy.get(".tree-branch ul .tree-branch li[style='display: list-item;']").contains(webElement)
            case 'Promt': return cy.get("button.btn-default.btn-lg").contains("Prompt Box")
            case 'newUserBtn': return cy.get("button#save")
            case 'loadingBar': return cy.get("#loading")
            case 'firstNameInput': return cy.get("input[name='first_name']")
            case 'lastNameInput': return cy.get("input[name='last_name']")
            case 'emailInput': return cy.get("input[name='email']")
            case 'cityInput': return cy.get("input[name='city']")
            case 'stateInput': return cy.get("select[name='state']")
            case 'hostingTrue': return cy.get("input[name='hosting'][value='yes']")
            case 'hostingFalse': return cy.get("input[name='hosting'][value='no']")
            case 'projectInput': return cy.get("textarea[name='comment']")
            case 'sendButton': return cy.get(".form-group [type='submit']")
            case 'firstDrag': return cy.get("#todrag [draggable]:nth-of-type(1)")
            case 'dropBox': return cy.get("div#mydropzone")
            case 'droppedElements': return cy.get("#droppedlist span")
            case 'inputForm': return cy.get("input#user-message")
        }
    }
}

export default SeleniumEasyQuery;
