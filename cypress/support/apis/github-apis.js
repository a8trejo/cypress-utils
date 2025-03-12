class GithubApi {
  getWorkflows(repoPath, apiLogLvl) {
    return cy
      .apiGithub({
        method: "GET",
        url: `/repos/${repoPath}/actions/workflows`,
      }, apiLogLvl)
      .then((response) => {
        return response;
      });
  }

  getWorkflowsRuns(repoPath, workflowId, apiLogLvl) {
    return cy
      .apiGithub({
        method: "GET",
        url: `/repos/${repoPath}/actions/workflows/${workflowId}/runs?per_page=100`,
      }, apiLogLvl)
      .then((response) => {
        return response;
      });
  }

  getIssues(repoPath, parameters, apiLogLvl) {
    return cy
      .apiGithub({
        method: "GET",
        url: `/repos/${repoPath}/issues`,
        qs: parameters
      }, apiLogLvl)
      .then((response) => {
        return response;
      });
  }
}

export const githubAPI = new GithubApi();
