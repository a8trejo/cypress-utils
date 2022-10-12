const { defineConfig } = require('cypress')
const fs = require('fs-extra');
const mysql = require('mysql')

const FactorySeleniumEasy = require('./cypress/fixtures/SeleniumEasyFactory');
let githubActionsKeys = {}
  
module.exports = defineConfig({
  e2e: {
    watchForFileChanges: false,
    specPattern: ["cypress/e2e/**/*.cy.{js,jsx,ts,tsx}"],
    pageLoadTimeout: 90000,
    responseTimeout: 45000,
    defaultCommandTimeout: 10000,
    video: false,
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
        "DB_CONFIG": {
          "wordpress-db": {
            "db_name": "wordpress-db",
            "base_url": {
                "local": "localhost",
                "dev": "http://cool-site-db:dev",
                "test": "http://cool-site-db:test"
            },
            "port": {
                "local": 3306,
                "dev": 3306,
                "test": 3306
            }
          }
      },
        "username": "[SHOULD BE OVERWRITTEN]",
        "password": "[SHOULD BE OVERWRITTEN]",
        "ACTION_TEST": "[SHOULD BE OVERWRITTEN]",
    },
    setupNodeEvents,
  }
})

async function setupNodeEvents(on, config) {
  //When running in GitHubActions config.env.TEST_TRIGGER will be 'workflow_dispatch' refer to (.github/workflows/qe.yml)
  const testTrigger = config.env.TEST_TRIGGER || 'default'
  const envKey = config.env.envKey || 'local';
  config.env['envKey'] = envKey

  if (envKey !== 'local') {
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
    },
    dbExec({dbName, sql}) {
      return dbQuery(dbName, sql, config)
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

// sql, dbName, config
function dbQuery(dbName, query, config) {
  const envKey = config.env.envKey
  
  // Config options in https://github.com/mysqljs/mysql
  const dbConfig = {
    "host": config.env.DB_CONFIG[dbName].base_url[envKey],
    "port": config.env.DB_CONFIG[dbName].port[envKey],
    "user": config.env.DB_USER,
    "password": config.env.DB_PASSWORD,
    "database": dbName
  }
  const dbConnection = mysql.createConnection(dbConfig)
  dbConnection.connect()

  // exec query + disconnect to db as a Promise
  return new Promise((resolve, reject) => {
    dbConnection.query(query, (error, dbResults) => {
      if (error) reject(error)
      else {
        dbConnection.end()
        // console.log(dbResults)
        return resolve(dbResults)
      }
    })
  })
}