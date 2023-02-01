/** @type {import('jest').Config} */
const config = {
  verbose: true,
  moduleFileExtensions: ['js','json','vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue3-jest'
  },
  testEnvironment: 'jsdom',
  /*testEnvironmentOptions: {
      "browsers": [
        "chrome",
        "firefox",
        "safari"
      ]
    },*/
};

module.exports = config;
