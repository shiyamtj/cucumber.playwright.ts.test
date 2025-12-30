import chalk from 'chalk'

const icons = {
  info: 'ℹ️',
  success: '✅',
  warn: '⚠️',
  error: '❌',
  debug: '🐞',
}

export const logger = {
  info: (...args: any[]) => {
    console.log(chalk.blue(`${icons.info} [INFO]`), ...args)
  },
  success: (...args: any[]) => {
    console.log(chalk.green(`${icons.success} [SUCCESS]`), ...args)
  },
  warn: (...args: any[]) => {
    console.warn(chalk.yellow(`${icons.warn} [WARN]`), ...args)
  },
  error: (...args: any[]) => {
    console.error(chalk.red(`${icons.error} [ERROR]`), ...args)
  },
  debug: (...args: any[]) => {
    console.debug(chalk.magenta(`${icons.debug} [DEBUG]`), ...args)
  },
  separator: (length = 50) => {
    console.log(chalk.yellowBright('_'.repeat(length)))
  },
}
