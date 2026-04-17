const { defineConfig } = require('cypress')
const fs = require('fs-extra')
import type { Browser as PuppeteerBrowser } from 'puppeteer-core'
import { setup, retry } from '@cypress/puppeteer'
import configUtils from './config-utils'

module.exports = defineConfig({
    e2e: {
        morgan: false,
        watchForFileChanges: false,
        specPattern: ['cypress/src/**/*.cy.{js,jsx,ts,tsx}'],
        pageLoadTimeout: 90000,
        responseTimeout: 45000,
        defaultCommandTimeout: 10000,
        video: false,
        chromeWebSecurity: false,
        experimentalSessionAndOrigin: true,
        screenshotsFolder: 'cypress/results/screenshots',
        videosFolder: 'cypress/results/videos',
        downloadsFolder: 'cypress/results/downloads',
        supportFile: 'cypress/support/plugins.ts',
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

async function setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
    // Utilize the Puppeteer browser instance and the Puppeteer API to interact with and automate the browser
    setup({
        on,
        onMessage: {
            async waitForNetworkIdle(
                browser: PuppeteerBrowser,
                timeout: number,
                retryTimeout: number,
                concurrency: number
            ) {
                // Utilize the retry since the page may not have opened and loaded by the time this runs
                const page = await configUtils.returnCypressPage(browser)
                // Cypress will maintain focus on the Cypress tab within the browser. It's generally a good idea to bring the page to the front to interact with it.
                await page.bringToFront()

                const retryMs = retryTimeout ?? config.env.networkIdleRetryTimeout
                const idleTimeout = timeout ?? config.env.networkIdleTimeout

                let timeoutId: NodeJS.Timeout | undefined

                // Create a timeout promise that resolves with null after retryMs
                const timeoutPromise = new Promise<null>(resolve => {
                    timeoutId = setTimeout(() => {
                        console.log(
                            `\ncy.puppeteer :: waitForNetworkIdle :: timeout reached after ${retryMs}ms. Network may still be active.\n`
                        )
                        resolve(null)
                    }, retryMs)
                })

                // Create the retry promise - give it more time than timeoutPromise
                const retryPromise = retry(
                    async () => {
                        await page.waitForNetworkIdle({ idleTime: idleTimeout, concurrency: concurrency })
                        return true
                    },
                    // Forcing timeoutPromise to resolve before retryPromise
                    { timeout: retryMs + idleTimeout }
                ).catch(() => {
                    // If retry fails, resolve with false instead of rejecting
                    return false
                })

                // Race between timeout and retry - whichever resolves first wins
                const result = await Promise.race([retryPromise, timeoutPromise])

                // Clean up the timeout to prevent memory leaks
                clearTimeout(timeoutId)

                return result
            },
        },
    })
    const envKey = config.env.envKey ?? 'local'
    config.env['envKey'] = envKey
    let repoUsers = config.env.repoUsers ?? 'local-users'

    if (envKey !== 'local') {
        config = configUtils.getConfigByFile(envKey, config)
    }

    require('@cypress/grep/src/plugin')(config)

    // Once a reporter is chosen, pass the path dynamically
    configUtils.cleanReports('./cypress/results/reports')

    // Revisit with sh file instead
    // config = configUtils.getSecretsByKey(envKey, config, repoUsers)

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
            return configUtils.dbQuery(sql, dbConfig)
        },
        readPDF(pdfPath) {
            return configUtils.readPdf(pdfPath)
        },
        deleteFile(filePath: string) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                return null
            }
            return null
        },
        deleteFolder(folderPath: string) {
            const localPath = `cypress/${folderPath}`
            if (fs.existsSync(localPath)) {
                fs.rmdirSync(localPath, { recursive: true })
            }
            return null
        },
    })

    return config
}
