import { ApiLogLvl } from '../plugins'

/**
 * API call to Github
 *
 * @param options
 * @param apiDOM - if true, the call is made with cy.api, if false, with cy.request
 */
Cypress.Commands.add('apiGithub', (options, apiDOM = ApiLogLvl.REQUEST) => {
    const apiOptions = {
        ...options,
        ...{
            url: Cypress.env('githubApi') + options.url,
            headers: {
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                Authorization: `Bearer ${Cypress.env('GITHUB_TOKEN')}`,
                ...options.headers,
            },
            failOnStatusCode: false,
        },
    }

    if (apiDOM) {
        cy.api(apiOptions).then(response => {
            return response
        })
    } else {
        cy.request(apiOptions).then(response => {
            return response
        })
    }
})
