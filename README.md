### CYPRESS AUTOMATION FRAMEWORK
----------------------------------------------------------------------

#### LOCAL SET UP
In order to run the automated test suite, please follow the steps described below:

1. If this is the first time cloning the repository, execute the following command in the project's terminal: `npm install`

2. Execute the command `cp secrets-example.env.sh secrets.env.sh` and replace the content on `secrets.env.sh` with your proper credentials

3. Export the secrets in the above file running `source secrets.env.sh`

3. Run one of the commands below depending on which environment needs to be tested  
   - To execute the tests using the Test Runner (does not generate reports)  
     - `npx cypress open --env envKey=dev`
     - `npx cypress open --env envKey=uat`

   - To execute the testing headless (generates the reports)  
     - `npx cypress run --env envKey=dev`
     - `npx cypress run --env envKey=uat`

4. To generate the mochawesome complete report, first execute the tests headless and afterwards run the command:  `npm run awesome-report`

Additional options available
   + To record the tests into the __[Cypress Dashboard](https://dashboard.cypress.io/)__ `CYPRESS_PROJECT_ID={projectId} CYPRESS_RECORD_KEY={record key} npx cypress run --record`
   + To choose a specific test file `npx cypress run --spec cypress/{SPEC FILE PATH}`
   + To choose a pattern of files into the Test Runner `npx cypress open testFiles='cypress/tests/e2e/hero*'`
   + If the DB test throws an error such as: `ER_NOT_SUPPORTED_AUTH_MODE`, as seen in, run the following commands:
    - `sudo mysql -u root -p`
    - `mysql> ALTER USER the_user IDENTIFIED WITH mysql_native_password BY 'the_password';`