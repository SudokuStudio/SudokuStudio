module.exports = {
  "roots": [
    "<rootDir>/src",
    "<rootDir>/test",
  ],
  "testMatch": [
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  "moduleFileExtensions": [
    "js",
    "ts",
  ],
};
