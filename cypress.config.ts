import { defineConfig } from "cypress";

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter', // HTML Reports
  experimentalStudio:true,
  video: true, // Record video of runs
  e2e: {
    baseUrl: 'http://localhost:5173', // Frontend URL
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
    defaultCommandTimeout: 6000,
  },
});

// This is a test