import reporter from 'cucumber-html-reporter'
import fs from 'fs-extra'

let browser: string = process.env.BROWSER || 'chromium'

fs.ensureDirSync('reports/cucumber-html')

reporter.generate({
  brandTitle: 'Test Execution Report',
  theme: 'bootstrap',
  jsonDir: 'reports/json/',
  output: 'reports/cucumber-html/cucumber-report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  columnLayout: 2,
  screenshotsDirectory: 'reports/cucumber-html/screenshots/',
  storeScreenshots: true,
  ignoreBadJsonFile: true,

  metadata: {
    'App Version': '0.3.2',
    'Test Environment': 'TBD',
  },
})
