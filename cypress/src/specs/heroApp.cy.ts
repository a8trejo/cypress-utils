import { herokuApp } from '../pages/HerokuPage'

const baseURL = Cypress.env('HeroApp')

before(() => {
    Cypress.config('baseUrl', baseURL)
})

describe('Hero App Web Automation', () => {
    it('Basic Auth promt', { tags: ['@smoke'] }, () => {
        cy.visit('/')
        // Define and Encode the authentication string
        const authString = `${Cypress.env('username')}:${Cypress.env('password')}`
        const encodedAuth = Buffer.from(authString).toString('base64')
        const authorizedMsg = 'Congratulations! You must have the proper credentials'

        // Preparing to intercept the /basic_auth request and add the auth header once we click on login
        cy.intercept('GET', '**/basic_auth', req => {
            req.headers['authorization'] = `Basic ${encodedAuth}`
        }).as('basicAuth')
        herokuApp.basicAuth().click()
        herokuApp.authorizedMsg().should('contain', authorizedMsg)
    })

    it('Reusing DOM elements in between multiple windows', () => {
        cy.visit('/windows')

        // Saving an element as a promise to be used later on when it cannot be re-queried from the DOM
        const firstTextPromise = new Promise(resolve => {
            herokuApp.window1Text().then($value => {
                resolve($value.text().toLocaleLowerCase())
            })
        })

        // Moving to a new window, different DOM
        herokuApp.window2Button().invoke('removeAttr', 'target').click()
        herokuApp.window2Text().then($headerElement => {
            const secondText = $headerElement.text().toLocaleLowerCase()

            // Accesing the promised element with cy.wrap
            cy.wrap(firstTextPromise).then(firstText => {
                expect(firstText).to.include(secondText)
            })
        })
    })

    it('Preventing a form from submitting', () => {
        cy.visit('/key_presses')
        herokuApp.inputBox().should('be.visible').and('be.enabled')

        // cy.get("form")
        herokuApp.inputForm().then(form$ => {
            form$.on('submit', e => {
                e.preventDefault()
            })
        })

        // This {enter} by default submits the form, it wont after the above modification
        herokuApp.inputBox().type('{enter}')
        herokuApp.temporalMsg().should('contain', 'You entered: ENTER')
    })

    it('Re-querying the DOM for an element', () => {
        cy.visit('/dynamic_controls')
        herokuApp.toggleButton().should('be.enabled').and('contain', 'Remove').click()
        herokuApp.loadingBar().should('be.visible')
        // 'should' assertion re-queries the DOM such as cy.get("#message", { timeout: 15000 }).should('be.visible')
        herokuApp.toggleMsg().should('be.visible')
    })

    it('Horizontal Slider Value Range', () => {
        cy.visit('/horizontal_slider')

        herokuApp.slideBar().invoke('val', 3).trigger('change')
        herokuApp.slideValue().should('contain', 3)
    })

    it('Jquery UI and Download File', () => {
        cy.visit('/jqueryui/menu')

        herokuApp.enabledMenu().click()
        herokuApp.downloadsMenu().click()

        herokuApp
            .pdfDownload()
            .invoke('attr', 'href')
            .then(downloadUrl => {
                herokuApp.pdfDownload().invoke('removeAttr', 'href').click({ force: true })
                cy.api({ url: downloadUrl })
            })
    })

    it('Single Iframe', () => {
        cy.visit('/iframe')
        // const iframeText = "------------------YESSSSSSS------------------"

        // Under the hood runs the following chain of commands with a cy.wrap at the end
        // return cy.get("iframe#mce_0_ifr").its('0.contentDocument.body').should('not.be.empty').then(cy.wrap)
        herokuApp.iframeInput().should('be.visible').and('contain', 'Your content goes here')
        herokuApp.dismissCallout().click()
        // herokuApp.iframeInput().clear().type(iframeText)
        // This specific iframe allows directly typing into the body as it is a MCE WYSIWYG Editor

        // herokuApp.iframeInput().should('contain', iframeText)

        // Used https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/ as guide
    })

    it('Custom error msg on assertions', () => {
        cy.visit('/horizontal_slider')
        const succesMsg = 'The Slider was moved succesfully!'

        herokuApp.slideBar().type('3')

        // Binding to this event without rethrowing the error will prevent the test from failing
        Cypress.on('fail', (error, runnable) => {})

        herokuApp.slideValue().should($e => {
            const sliderValue = $e.text()
            assert.isTrue(sliderValue === '3', succesMsg)
        })
    })
})
