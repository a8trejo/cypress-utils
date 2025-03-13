const fs = require('fs-extra')
const mysql = require('mysql')
const path = require('path')
const pdf = require('pdf-parse')
const retry = require('@cypress/puppeteer').retry

class CypressConfigUtils {
    /**
     * Cleans everything under the cypress/results/reports folder at the start of the tests
     * @param reportPath: (Path of the reports folder)
     */
    cleanReports = reportPath => {
        if (fs.existsSync(reportPath)) {
            fs.rmdirSync(reportPath, { recursive: true })
        }
    }

    /**
     * Reads the configurations of the cypress/config/roo_*.json files depending on envKey
     * @param envKey: ('local', 'dev', 'stage', 'prod')
     * @param config: (The cypress configuration passed by the cypress.config.ts file in setupNodeEvents)
     *
     * @return config (The updated cypress configuration depending on the environment)
     */
    getConfigByFile = (envKey, config) => {
        let fileName = `roo_${envKey}.json`
        console.log('Config file: ' + fileName)

        let rawData = fs.readFileSync(`cypress/config/${fileName}`)
        let newConfig = JSON.parse(rawData)

        config = { ...config, ...newConfig }
        return config
    }

    /**
     * Reads the secrets stored in process.env by either `secrets.json` or `cypress/config/aws-secrets.sh`
     * @param envKey: ('local', 'dev', 'stage', 'prod'), reads the respective secrets of the environment
     * @param config: (The cypress configuration passed by the cypress.config.ts file in setupNodeEvents)
     *
     * @return config (The updated cypress configuration now including the environment secrets)
     */
    getSecretsByKey = (envKey, config, repoUsers = '') => {
        if (fs.existsSync('secrets.json')) {
            config.env['envKey'] = envKey
            envKey = envKey === 'ci' ? 'DEV' : envKey.toUpperCase()
            repoUsers = repoUsers.split('-')[1].toUpperCase()
            const envJSON = fs.readFileSync('secrets.json')
            const localSecrets = JSON.parse(envJSON)

            // All secrets with an environment suffix ex: TECH_USER_CA_SF_DEV, are set as a Cypress environment variable withouth the suffix ex: TECH_USER_CA_SF
            Object.keys(localSecrets).forEach(secret => {
                const envIndex = secret.lastIndexOf(`_${envKey}`)
                if (envIndex !== -1) {
                    const secretName = secret.substring(0, envIndex)
                    const repoIndex = secretName.lastIndexOf(`_${repoUsers}`)

                    // Add secrets if they are not already in the config and if the secret name doesn't specify a repo, or specifies REACT
                    if ((repoIndex === -1 || repoUsers === 'REACT') && !config.env.hasOwnProperty(secretName)) {
                        config.env[secretName] = localSecrets[secret]
                    } else if (repoUsers === 'NODE' && repoIndex !== -1) {
                        // All secrets related to NODE users, ex: H_USER_MSG_TECHS_NODE gets renamed as H_USER_MSG_TECHS
                        const repoSecretName = secretName.substring(0, repoIndex)
                        config.env[repoSecretName] = localSecrets[secret]
                    }
                }
            })
            return config
        } else if (envKey === 'local') {
            throw new Error('Credentials are Empty! Secrets not found, please run the aws-secrets.sh script')
        } else {
            console.log('Credentials are Empty! Secrets not found, make sure they are in process.env')
        }
    }

    /**
     * Establishes a connection to a MySQL database and sends/fetchs the results of a SQL query
     * @param query: (The SQL query as a string)
     * @param dbConfig: (DB Config in JSON format)
     *
     * @return promise containing an array with the fetched rows of the query
     */
    dbQuery = (query, dbConfig) => {
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

        // Optionally the DB Config object could be read from the cypress config object such as:
        // Leaving it flexible to eventually read multiple DBs with the same function
    }

    /**
     * Reads a PDF file and returns its text content.
     * @param filePath - The path to the PDF file.
     * @returns A promise that resolves with the text content of the PDF file.
     */
    readPdf = filePath => {
        //@ts-ignore
        return new Promise((resolve, reject) => {
            const pdfPath = path.resolve(filePath)
            let dataBuffer = fs.readFileSync(pdfPath)

            //@ts-ignore
            pdf(dataBuffer).then(function ({ text }) {
                resolve(text)
            })
        })
    }

    /**
     * Retrieves the Cypress runner page from a Puppeteer browser instance.
     * Uses retry mechanism to handle cases where the page might not be immediately available.
     *
     * @param browser - The Puppeteer browser instance to search for the Cypress page
     * @returns Promise<Page> - A promise that resolves to the Cypress runner page
     * @throws Error - If the page containing 'specs/runner' cannot be found after retries
     */
    returnCypressPage = async browser => {
        const cySpecString = 'specs/runner'
        return (
            (await retry) <
            Promise <
            Page >>
                (async () => {
                    const pages = await browser.pages()
                    const page = pages.find(page => {
                        return page.url().includes(cySpecString)
                    })

                    // If we haven't found the page, throw an error to signal that it should retry
                    if (!page) throw new Error(`Could not find page matching ${cySpecString}`)

                    // Otherwise, return the page instance and it will be returned by the `retry` function itself
                    return page
                })
        )
    }
}

module.exports = CypressConfigUtils
