import { defineConfig } from "cypress";
import { allureCypress } from "allure-cypress/reporter";
import { enderecos } from "./lib/serverest/enderecos";

export default defineConfig({
  e2e: {
    baseUrl: enderecos.frontend,
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 15000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    pageLoadTimeout: 60000,
    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: "allure-results",
      });

      return config;
    },
  },
});
