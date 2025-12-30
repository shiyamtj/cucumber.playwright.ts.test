import { XrayUtil } from '../support/xray.util'
const xrayUtil = new XrayUtil()

async function importCucumberResults() {
  await xrayUtil.updateResults('tests/report/cucumber-report.json', {
    testPlanKey: process.env.XRAY_TEST_PLAN,
    testExecutionKey: process.env.XRAY_TEST_EXECUTION,
  })
}

async function importCucumberFeatures() {
  // Import single feature file
  // await xrayUtil.importFeatureFile('tests/features/saucedemo/login.feature')

  // Import feature files in a directory
  if (process.env.IMPORT_FEATURES) {
    await xrayUtil.importFeatureFiles(process.env.IMPORT_FEATURES)
  }
}

async function execute() {
  try {
    await importCucumberFeatures()
    await importCucumberResults()
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error on execute: ', error.message)
    } else {
      console.error('Error on execute: ', String(error))
    }
    throw error
  }
}

execute()
