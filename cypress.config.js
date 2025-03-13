const { defineConfig } = require('cypress')
const fs = require('fs-extra')
const setup = require('@cypress/puppeteer').setup

const FactorySeleniumEasy = require('./cypress/fixtures/SeleniumEasyFactory')
const CypressConfigUtils = require('./cypress-config-utils')
const setConfig = new CypressConfigUtils()

module.exports = defineConfig({
    e2e: {
        morgan: false,
        watchForFileChanges: false,
        specPattern: ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'],
        pageLoadTimeout: 90000,
        responseTimeout: 45000,
        defaultCommandTimeout: 10000,
        video: false,
        chromeWebSecurity: false,
        experimentalSessionAndOrigin: true,
        screenshotsFolder: 'cypress/results/screenshots',
        videosFolder: 'cypress/results/videos',
        downloadsFolder: 'cypress/results/downloads',
        supportFile: 'cypress/support/e2e.js',
        reporter: 'cypress-multi-reporters',
        reporterOptions: {
            configFile: 'cypress/config/reporter-configs.json',
        },
        env: {
            githubApi: 'https://api.github.com',
            TAGS: 'not @skip',
            hideCredentials: 'false',
            SeleniumEasy: 'https://demo.seleniumeasy.com/',
            HeroApp: 'https://the-internet.herokuapp.com/',
            expandCollapseTime: 1500,
            jiraProjectKey: 'QE',
            metaDataPath: 'cypress/results/reports/metadata/cypress-utils.json',
            DB_CONFIG: {
                'wordpress-db': {
                    db_name: 'wordpress-db',
                    base_url: {
                        local: 'localhost',
                        dev: 'http://cool-site-db:dev',
                        test: 'http://cool-site-db:test',
                    },
                    port: {
                        local: 3306,
                        dev: 3306,
                        test: 3306,
                    },
                },
            },
            username: 'admin',
            password: 'admin',
            ACTION_TEST: '[SHOULD BE OVERWRITTEN]',
            GITHUB_TOKEN: '[SHOULD BE OVERWRITTEN]',
        },
        setupNodeEvents,
    },
})

async function setupNodeEvents(on, config) {
    // Utilize the Puppeteer browser instance and the Puppeteer API to interact with and automate the browser
    setup({
        on,
        onMessage: {
            async waitForNetworkIdle(browser) {
                // Utilize the retry since the page may not have opened and loaded by the time this runs
                const page = await setConfig.returnCypressPage(browser)
                // Cypress will maintain focus on the Cypress tab within the browser. It's generally a good idea to bring the page to the front to interact with it.
                await page.bringToFront()
                await page.waitForNetworkIdle({ idleTime: config.env.networkIdleTimeout, timeout: 45000 })
            },
        },
    })
    const envKey = config.env.envKey || 'local'
    config.env['envKey'] = envKey
    let repoUsers = config.env.repoUsers ?? 'local-users'

    if (envKey !== 'local') {
        config = setConfig.getConfigByFile(envKey, config)
    }

    require('@cypress/grep/src/plugin')(config)

    // Once a reporter is chosen, pass the path dynamically
    setConfig.cleanReports('./cypress/results/reports')
    fixturesFactory(config)

    config = setConfig.getSecretsByKey(envKey, config, repoUsers)

    on('task', {
        logMsg(msg) {
            console.log(msg)
            return null
        },
        readJsonMaybe(jsonPath) {
            if (fs.existsSync(jsonPath)) {
                return fs.readJson(jsonPath)
            }
            return {}
        },
        dbExec({ sql, dbConfig }) {
            return setConfig.dbQuery(sql, dbConfig)
        },
        readPDF(pdfPath) {
            return setConfig.readPdf(pdfPath)
        },
    })

    return config
}

function fixturesFactory(config) {
    const cypressEnv = { ...config.env }
    FactorySeleniumEasy.fixtureFactory(cypressEnv)
}
