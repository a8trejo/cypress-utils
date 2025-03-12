/// <reference types="cypress" />

class HeroAppQuery {
    homeHeader = () => cy.get("#content h1")
    basicAuth  = () => cy.get("li>a").contains("Basic Auth")
    authorizedMsg  = () => cy.get(".example p")
    window1Text  = () => cy.get(".example h3")
    window2Button  = () => cy.get(".example a")
    window2Text  = () => cy.get(".example h3")
    inputForm  = () => cy.get(".example form")
    inputBox  = () => cy.get("#target")
    temporalMsg  = () => cy.get("p#result")
    toggleButton  = () => cy.get("#checkbox + button")
    loadingBar  = () => cy.get("#loading")
    
    // Any timeout on a cy.get will be inherited by a 'should' when re-querying the DOM
    toggleMsg  = () => cy.get("#message", { timeout: 15000 })
    slideBar  = () => cy.get("input[type='range']")
    slideValue  = () => cy.get("span#range")
    enabledMenu  = () => cy.get("#ui-id-2>span")
    downloadsMenu  = () => cy.get("#ui-id-4>span")
    pdfDownload  = () => cy.get("#ui-id-6")
    iframeInput  = () => HeroAppQuery.iframeBody()
    dismissCallout  = () => cy.get("button.tox-notification__dismiss")

    static iframeBody () {
        // Only the last command its('body') is retried
        return cy.get("iframe#mce_0_ifr").its('0.contentDocument.body').should('not.be.empty')
        .then(cy.wrap)
    }
}

export default HeroAppQuery;
