const fs = require('fs-extra')
const path = require('path')

const reportsDir = path.join(__dirname, '..', '..', 'reports', 'json')
console.log('Adding metadata to reports in directory:', reportsDir)
// console.log available files in the reports directory
const fileTemp = fs.readdirSync(reportsDir)
console.log('Files in report directory:', fileTemp)

const files = fs
  .readdirSync(reportsDir)
  .filter((file) => file.endsWith('.json'))

files.forEach((file) => {
  const filePath = path.join(reportsDir, file)
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

    report.forEach((feature) => {
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
