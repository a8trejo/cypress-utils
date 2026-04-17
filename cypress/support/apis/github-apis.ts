/**
 * Get workflows for a GitHub repository
 *
 * @param repoPath - Repository path (e.g., "owner/repo")
 * @param apiLogLvl - API logging level
 * @returns Cypress chainable with workflows data
 */
const getWorkflows = (repoPath: string, apiLogLvl: boolean): Cypress.Chainable<any> => {
    return cy
        .apiGithub(
            {
                method: 'GET',
                url: `/repos/${repoPath}/actions/workflows`,
            },
            apiLogLvl
        )
        .then(response => {
            return response
        })
}

/**
 * Get workflow runs for a specific workflow
 *
 * @param repoPath - Repository path (e.g., "owner/repo")
 * @param workflowId - Workflow ID
 * @param apiLogLvl - API logging level
 * @returns Cypress chainable with workflow runs data
 */
const getWorkflowsRuns = (repoPath: string, workflowId: number, apiLogLvl: boolean): Cypress.Chainable<any> => {
    return cy
        .apiGithub(
            {
                method: 'GET',
                url: `/repos/${repoPath}/actions/workflows/${workflowId}/runs?per_page=100`,
            },
            apiLogLvl
        )
        .then(response => {
            return response
        })
}

/**
 * Get issues for a GitHub repository
 *
 * @param repoPath - Repository path (e.g., "owner/repo")
 * @param parameters - Query parameters for filtering issues
 * @param apiLogLvl - API logging level
 * @returns Cypress chainable with issues data
 */
const getIssues = (repoPath: string, parameters: any, apiLogLvl: boolean): Cypress.Chainable<any> => {
    return cy
        .apiGithub(
            {
                method: 'GET',
                url: `/repos/${repoPath}/issues`,
                qs: parameters,
            },
            apiLogLvl
        )
        .then(response => {
            return response
        })
}

/**
 * GitHub API service
 */
const githubAPI = {
    getWorkflows,
    getWorkflowsRuns,
    getIssues,
}

export default githubAPI
