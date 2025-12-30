module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/config/env.ts', 'src/steps/**/*.ts'],
    paths: ['src/features/**/*.feature'],
    parallel: 2,
  },
}
