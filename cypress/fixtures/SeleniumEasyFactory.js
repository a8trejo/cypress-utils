const fs = require("fs");

class SeleniumEasyFactory {
    static fixtureFactory(cypressEnv) {
        //cypressEnv might not be used? Deciding to use github Secrets for test data or another approach
        let testScenarios = {}
        testScenarios["Form Data"] = SeleniumEasyFactory.getFormDataScenarios()

        fs.writeFileSync('./cypress/fixtures/seleniumEasy.json', JSON.stringify(testScenarios));
    }

    static getFormDataScenarios() {
        let testScenarios = []

        const happyPath = {
            "title": "aegon-the-conquerer",
            "tags": ["@regression"],
            "arguments": {
                "firstName": "Aegon",
                "lastName": "Targaryen",
                "email": "aegon@ironthrone.com",
                "hosting": true,
                "state": "California",
                "city": "Kings Landing",
                "projectDescription": "Conquest and Unification of Westeros"
            }
        }

        const roguePrince = {...happyPath, ...{
            "title": "rogue-prince",
            "tags": ["@smoke"],
            "arguments": {...happyPath.arguments,
                "firstName": "Daemon",
                "email": "daemon@ironthrone.com",
                "projectDescription": "Dance of the Dragons"
            }
        }}

        const trueHeir = {...roguePrince, ...{
            "title": "true-heir",
            "tags": ["@smoke"],
            "arguments": {...roguePrince.arguments,
                "firstName": "Rhaenyra",
                "email": "rhaenyra@ironthrone.com",
                "hosting": false,
            }
        }}

        testScenarios.push(happyPath, roguePrince, trueHeir)
        return testScenarios
    }
}

module.exports = SeleniumEasyFactory;