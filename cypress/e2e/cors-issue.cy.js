describe('CORS ISSUE', () => {
    it('cors issue', () => {
        cy.intercept('POST', '**/cdn-cgi/challenge-platform/**').as('challengePlatform')
        cy.intercept('https://example.com/').as('corsExample')
        cy.visit('https://webbrowsertools.com/test-cors/')
        cy.wait('@challengePlatform')
        cy.get("input[method='CREDENTIALWHEADERS']").scrollIntoView().click()
        cy.get('#test-cors-result-CREDENTIALWHEADERS').should('contain', 'CORS is blocked for GET (with credentials)')
    })
})