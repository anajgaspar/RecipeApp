module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.spec.ts"],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ["<rootDir>/tests/setupEnv.ts"]
};