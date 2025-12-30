import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber'
import {
  Browser,
  BrowserContext,
  Page,
  firefox,
  webkit,
  chromium,
} from '@playwright/test'
import fs from 'fs-extra'
import path from 'path/win32'

const viewports = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
}

export class CustomWorld extends World {
  public browser!: Browser
  public page!: Page
  public context!: BrowserContext

  constructor(options: IWorldOptions) {
    super(options)
  }

  async launchBrowser() {
    const browserType = process.env.BROWSER || 'chromium'
    const headless = process.env.HEADLESS === 'true'
    const viewportName = (process.env.VIEWPORT ||
      'desktop') as keyof typeof viewports
    const viewport = viewports[viewportName]

    switch (browserType.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch({ headless })
        break
      case 'webkit':
        this.browser = await webkit.launch({ headless })
        break
      default:
        this.browser = await chromium.launch({ headless })
        break
    }

    const version = this.browser.version()

    const reportDir = path.join(__dirname, '..', '..', 'reports')
    console.log('Browser Type:', browserType)
    console.log('Browser Version:', version)
    console.log('Headless Mode:', headless)
    console.log('Viewport:', viewportName)
    console.log('Report Directory:', reportDir)

    fs.ensureDirSync(reportDir)
    fs.writeFileSync(
      path.join(reportDir, `${browserType.toLowerCase()}.version`),
      version
    )

    // console.log available files in the reports directory
    const files = fs.readdirSync(reportDir)
    console.log('Files in report directory:', files)

    this.context = await this.browser.newContext({ viewport })
    this.page = await this.context.newPage()
  }

  async closeBrowser() {
    await this.page?.close()
    await this.context?.close()
    await this.browser?.close()
  }
}

setWorldConstructor(CustomWorld)
