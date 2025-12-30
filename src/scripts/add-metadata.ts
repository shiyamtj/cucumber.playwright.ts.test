import fs from 'fs-extra'
import path from 'path'
import { logger } from '../support/logger'

logger.separator(80)
console.log('Adding metadata to Cucumber JSON reports...')
const reportsDir = path.join(__dirname, '..', '..', 'reports')
console.log('Files in report directory:', fs.readdirSync(reportsDir))

const jsonDir = path.join(__dirname, '..', '..', 'reports', 'json')
console.log('Adding metadata to results in directory:', jsonDir)
console.log('Files in report directory:', fs.readdirSync(jsonDir))

const files = fs.readdirSync(jsonDir).filter((file) => file.endsWith('.json'))

files.forEach((file) => {
  const filePath = path.join(jsonDir, file)
  const report = fs.readJsonSync(filePath)
  const [browserName, viewportName] = path.basename(file, '.json').split('-')

  const versionFilePath = path.join(
    reportsDir,
    '..',
    `${browserName.toLowerCase()}.version`
  )

  let browserVersion = 'N/A'
  if (fs.existsSync(versionFilePath)) {
    browserVersion = fs.readFileSync(versionFilePath, 'utf-8')
  }

  if (report) {
    let reportBrowserName = browserName.toLowerCase()
    if (reportBrowserName === 'webkit') {
      reportBrowserName = 'safari'
    }
    if (reportBrowserName === 'chromium') {
      reportBrowserName = 'chrome'
    }

    ;(report as any[]).forEach((feature) => {
      feature.metadata = {
        browser: {
          name: reportBrowserName,
          version: browserVersion,
        },
        device: viewportName || 'Desktop',
        platform: {
          name: process.platform,
          version: process.version,
        },
      }
    })

    fs.writeJsonSync(filePath, report, { spaces: 2 })
  }
})
