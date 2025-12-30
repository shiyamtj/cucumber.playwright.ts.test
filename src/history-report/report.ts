import * as fs from 'fs-extra'
import * as path from 'path'
import { format } from 'date-fns'

const createReportHistory = async () => {
  const args = process.argv.slice(2)
  let reportHistoryDir = 'reports-history/html'
  let currentReportDir = 'reports/html'

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reportHistoryDir' && args[i + 1]) {
      reportHistoryDir = args[i + 1]
    }
    if (args[i] === '--currentReportDir' && args[i + 1]) {
      currentReportDir = args[i + 1]
    }
  }
  // Create timestamp for unique folder name
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  const newReportDir = path.join(reportHistoryDir, `report_${timestamp}`)

  try {
    // Create reports history directory if it doesn't exist
    await fs.ensureDir(newReportDir)

    // Copy files to report history directory
    const staticFiles = [
      'src/history-report/index.html',
      'src/history-report/app.js',
    ]
    for (const file of staticFiles) {
      await fs.copy(file, path.join(reportHistoryDir, path.basename(file)))
      console.log(`Copied ${file} to ${reportHistoryDir}`)
    }

    // Copy latest report to the new timestamped directory
    await fs.copy(currentReportDir, newReportDir)
    console.log(`Latest report moved to ${newReportDir}`)

    // Read directories and create data.json content
    const historyDirs = await fs.readdir(reportHistoryDir)
    const reportDirs = historyDirs.filter((dir) => dir.startsWith('report_'))

    const data = reportDirs.map((dir) => ({
      folderName: dir,
      linkText: dir,
    }))

    const dataJsonPath = 'data.json'
    await fs.writeJson(dataJsonPath, data, { spaces: 2 })

    // Copy data.json to report history directory
    await fs.copy(dataJsonPath, path.join(reportHistoryDir, 'data.json'), {
      overwrite: true,
    })
    console.log(`Copied data.json to ${reportHistoryDir}`)
  } catch (error) {
    console.error('Error generating report history:', error)
  }
}

createReportHistory()
