'use strict';

module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@pontoon-addon/commons/src/(.*)': '<rootDir>/../commons/src/$1.js',
    '@pontoon-addon/commons/static/(.*)/(.*)': '<rootDir>/../commons/static/$1/$2',
  },
};
