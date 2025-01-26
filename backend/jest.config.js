module.exports = {
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  clearMocks: true,
  verbose: true,
}
