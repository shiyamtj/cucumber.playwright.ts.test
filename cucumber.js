const workers = process.env.HEADLESS === 'true' ? 2 : 1

module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/config/env.ts', 'src/steps/**/*.ts', 'src/support/**/*.ts'],
    paths: ['src/features/**/*.feature'],
    parallel: workers,
  },
}
