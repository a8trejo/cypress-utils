import { githubAPI } from '../support/apis/github-apis'
import { ApiLogLvl } from '../support/e2e'

describe('As a github API user', () => {
    it('should be able to list my workflows and runs', () => {
        const repoPath = 'a8trejo/cypress-utils'
        githubAPI.getWorkflows(repoPath, ApiLogLvl.DOM).then((response) => {
            expect(response.status).to.eq(200)

            githubAPI.getWorkflowsRuns(repoPath, response.body.workflows[0].id, ApiLogLvl.DOM).as('workflowsRuns')
        })
        cy.get('@workflowsRuns').its('isOkStatusCode').should('equal', true)
    })

    it('should be able to list opened issues', () => {
        const repoPath = 'filiphric/cypress-plugin-api'
        const queryParams = {
            "state": "open"
        }
        githubAPI.getIssues(repoPath, queryParams, ApiLogLvl.DOM).then((response) => {
            expect(response.status).to.eq(200)

        })
    })
})