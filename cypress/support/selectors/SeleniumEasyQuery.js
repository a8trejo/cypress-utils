/// <reference types="cypress" />

class SeleniumEasyQuery {
    homePromptClose = () => cy.get('#at-cv-lightbox-close')
    alertsAndModals = () => cy.get('.tree-branch ul .tree-branch').contains(webElement)
    javascriptAlerts = () => cy.get(".tree-branch ul .tree-branch li[style='display: list-item;']").contains(webElement)
    Promt = () => cy.get("button.btn-default.btn-lg").contains("Prompt Box")
    newUserBtn = () => cy.get("button#save")
    loadingBar = () => cy.get("#loading")
    firstNameInput = () => cy.get("input[name='first_name']")
    lastNameInput = () => cy.get("input[name='last_name']")
    emailInput = () => cy.get("input[name='email']")
    cityInput = () => cy.get("input[name='city']")
    stateInput = () => cy.get("select[name='state']")
    hostingTrue = () => cy.get("input[name='hosting'][value='yes']")
    hostingFalse = () => cy.get("input[name='hosting'][value='no']")
    projectInput = () => cy.get("textarea[name='comment']")
    sendButton = () => cy.get(".form-group [type='submit']")
    firstDrag = () => cy.get("#todrag [draggable]:nth-of-type(1)")
    dropBox = () => cy.get("div#mydropzone")
    droppedElements = () => cy.get("#droppedlist span")
    inputForm = () => cy.get("input#user-message")
}

export default SeleniumEasyQuery;
