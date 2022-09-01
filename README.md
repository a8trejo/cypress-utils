### CYPRESS AUTOMATION FRAMEWORK
----------------------------------------------------------------------------

#### LOCAL SET UP
In order to run the automated test suite, please follow the steps described below:

1. If this is the first time cloning the repository, execute the following commands in the project's terminal:
```
 npm install
```

2. Run one of the commands below depending on which environment needs to be tested  
   - To execute the testing using the Test Runner (does not generate reports)  
   `npx cypress open --env envKey=dev`
   `npx cypress open --env envKey=uat`

   - To execute the testing headless (generates the reports)  
   `npx cypress run --env envKey=dev`
   `npx cypress run --env envKey=uat`

3. To generate the mochawesome complete report, first execute the tests headless and afterwards run the command:  
   `npm run awesome-report`
