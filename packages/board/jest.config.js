module.exports = {
  "roots": [
    "<rootDir>/src",
    "<rootDir>/test",
  ],
  "testMatch": [
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.svelte$": [
      "svelte-jester",
      {
        "preprocess": true
      }
    ],
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  "moduleFileExtensions": [
    "js",
    "ts",
    "svelte"
  ],
};
