import axios from 'axios'
import * as fs from 'fs'
import { format } from 'date-fns'

import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const FormData = require('form-data')

export class XrayUtil {
  private clientId: string
  private clientSecret: string
  private baseUrl: string
  private projectKey: string

  constructor() {
    this.clientId = process.env.XRAY_CLIENT_ID || ''
    this.clientSecret = process.env.XRAY_CLIENT_SECRET || ''
    // this.baseUrl = 'https://xray.cloud.getxray.app/api/v2'
    this.baseUrl = 'https://au.xray.cloud.getxray.app//api/v2'
    this.projectKey = process.env.XRAY_PROJECT || ''
  }

  private async getAuthToken(): Promise<string> {
    const response = await axios.post(
      'https://xray.cloud.getxray.app/api/v2/authenticate',
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }
    )
    return response.data
  }

  async updateResults(
    reportPath: string,
    info?: {
      summary?: string
      description?: string
      testPlanKey?: string
      testEnvironments?: string[]
      testExecutionKey?: string
    },
    projectKey?: string
  ): Promise<string> {
    try {
      const token = await this.getAuthToken()

      if (info?.testExecutionKey) {
        const testExecutionKey = info.testExecutionKey
        const cucumberReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

        // Update each feature object with testExecutionKey if it has tags
        cucumberReport.forEach((feature: any) => {
          if (
            feature.tags &&
            !feature.tags.some(
              (tag: any) => tag.name === `@${testExecutionKey}`
            )
          ) {
            feature.tags.push({
              name: `@${testExecutionKey}`,
              line: 1,
            })
          }
        })

        // Write updated report back to file
        fs.writeFileSync(reportPath, JSON.stringify(cucumberReport, null, 2))
      }

      const formData = new FormData()

      const currentDate = new Date()
      const currentDateTimeString = format(currentDate, 'yyyy-MM-dd-HH-mm-ss')

      const infoFile = {
        fields: {
          project: {
            key: projectKey || this.projectKey,
          },
          summary:
            info?.summary ||
            `Test Execution (Automated) | ${currentDateTimeString}`,
          description:
            info?.description ||
            `This test execution was created by automated script - Created Date | ${currentDateTimeString}`,
          issuetype: {
            name: 'Test Execution',
          },
        },
        xrayFields: {
          testPlanKey: info?.testPlanKey,
          environments: info?.testEnvironments,
        },
      }

      formData.append('results', fs.createReadStream(reportPath))
      formData.append('info', JSON.stringify(infoFile), {
        contentType: 'application/json',
        filename: 'info.json',
      })

      const response = await axios.post(
        `${this.baseUrl}/import/execution/cucumber/multipart`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log('======================================================')
      console.log(
        info?.testExecutionKey
          ? 'Test execution updated successfully'
          : 'New test execution created successfully'
      )
      console.log('Execution ID:', response.data.id)
      console.log('Test Execution Key:', response.data.key)
      console.log('======================================================')
      return response.data.key
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating new test execution:', error.message)
      } else {
        console.error('Error creating new test execution:', String(error))
      }
      console.log('======================================================')
      throw error
    }
  }

  async importFeatureFiles(path: string, projectKey?: string): Promise<void> {
    try {
      const stats = fs.statSync(path)
      const inputFile = stats.isDirectory()
        ? await this.zipToTempFolder(path)
        : path

      const token = await this.getAuthToken()

      const formData = new FormData()
      formData.append('file', fs.createReadStream(inputFile))

      const response = await axios.post(
        `${this.baseUrl}/import/feature`,
        formData,
        {
          headers: {
            'Content-Type': 'text/plain',
            Authorization: `Bearer ${token}`,
          },
          params: {
            projectKey: projectKey || this.projectKey,
          },
        }
      )
      console.log('======================================================')
      console.log('Feature file imported successfully to Xray')
      console.log('Created Test Issues:', response.data)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error import feature file:', error.message)
      } else {
        console.error('Error import feature file:', String(error))
      }
      throw error
    }
    console.log('======================================================')
  }

  private zipToTempFolder(featureFilesPath: string) {
    return new Promise<string>((resolve, reject) => {
      const path = require('path')
      const fs = require('fs')
      const archiver = require('archiver')

      const tempDir: string = path.join(
        __dirname,
        'temp',
        `features_dump_${Date.now()}.zip`
      )

      if (!fs.existsSync(path.dirname(tempDir))) {
        fs.mkdirSync(path.dirname(tempDir), { recursive: true })
      }

      const output = fs.createWriteStream(tempDir)
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Sets the compression level.
      })

      output.on('close', () => {
        console.log(`Created zip file: ${tempDir}`)
        resolve(tempDir)
      })

      output.on('end', () => {
        console.log(`end on output`)
      })

      output.on('error', () => {
        console.log(`Error on output`)
        reject('Error on output')
      })

      archive.on('error', () => {
        console.log(`Error on archive`)
        reject('Error creating zip file')
      })

      archive.pipe(output)
      archive.directory(featureFilesPath, false)

      archive.finalize().catch(() => {
        console.log(`Error on finalize archive`)
        reject('Error finalizing archive')
      })
    })
  }
}
