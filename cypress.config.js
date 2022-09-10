const { defineConfig } = require('cypress')
const fs = require('fs-extra');

const FactorySeleniumEasy = require('./cypress/fixtures/SeleniumEasyFactory');
let githubActionsKeys = {}
  
module.exports = defineConfig({
  e2e: {
    watchForFileChanges: false,
    specPattern: ["cypress/e2e/**/*.cy.{js,jsx,ts,tsx}"],
    pageLoadTimeout: 90000,
    responseTimeout: 45000,
    defaultCommandTimeout: 10000,
    video: true,
    chromeWebSecurity: false,
    experimentalSessionAndOrigin: true,
    screenshotsFolder: "cypress/results/screenshots",
    videosFolder: "cypress/results/videos",
    downloadsFolder: "cypress/results/downloads",
    supportFile: 'cypress/support/e2e.js',
    reporter: "cypress-multi-reporters",
    reporterOptions: {
        "configFile": "cypress/config/reporter-configs.json"
    },
    env: {
        "TAGS": "not @skip",
        "SeleniumEasy": "https://demo.seleniumeasy.com/",
        "HeroApp": "https://the-internet.herokuapp.com/",
        "expandCollapseTime": 1500,
        "jiraProjectKey": "QE",
        "metaDataPath" : "cypress/results/reports/metadata/cypress-utils.json",
        "username": "[SHOULD BE OVERWRITTEN]",
        "password": "[SHOULD BE OVERWRITTEN]",
        "ACTION_TEST": "[SHOULD BE OVERWRITTEN]",
    },
    setupNodeEvents,
  }
})

async function setupNodeEvents(on, config) {
  //When running in GitHubActions config.env.TEST_TRIGGER will be 'workflow_dispatch' refer to (.github/workflows/qe.yml)
  const testTrigger = config.env.TEST_TRIGGER || 'local'
  const envKey = config.env.envKey || 'default';

  if (envKey !== 'default') {
    config = getConfigByFile(envKey, config);
  }

  require('cypress-grep/src/plugin')(config);
  
  cleanReports();
  readGitHubSecrets(config);
  fixturesFactory(config);

  on('task', {
    logMsg(msg) {
      console.log(msg);
      return null;
    },
    getGithubKeys: () => {
      return githubActionsKeys;
    },
    readJsonMaybe(jsonPath) {
      if (fs.existsSync(jsonPath)) {
        return fs.readJson(jsonPath);
      }
      return {}
    }
  });

  return config;
}

function cleanReports() {
    const reportPath = './cypress/results/reports';
    if (fs.existsSync(reportPath)) {
        fs.rmdirSync('./cypress/results/reports', { recursive: true });
    }
};

function getConfigByFile(envKey, config) {
  let fileName = `cypress_${envKey}.json`
  console.log("Config file: " + fileName);

  let rawData = fs.readFileSync(`cypress/config/${fileName}`);
  let newConfig = JSON.parse(rawData);

  config = {...config, ...newConfig}
  return config;
};

function readGitHubSecrets(config) {
    githubActionsKeys["process_env_CYPRESS_ACTION_TEST"] = process.env.CYPRESS_ACTION_TEST
    githubActionsKeys["config_ACTION_TEST"] = config.env.ACTION_TEST
}

function fixturesFactory(config) {
  const cypressEnv = {...config.env}
  FactorySeleniumEasy.fixtureFactory(cypressEnv)
}