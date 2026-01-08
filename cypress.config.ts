import { defineConfig } from "cypress";
import pg from "pg"; // Import the pg client

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  experimentalStudio: true,
  video: true,
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      // Define the database query task
      on("task", {
        async queryDB(query) {
          // Create a new client with your credentials
          const client = new pg.Client({
            user: "postgres",
            password: "Partly3More6annual",
            host: "localhost",
            database: "venlab",
            port: 5432,
          });

          await client.connect();
          try {
            const res = await client.query(query);
            return res.rows; // Return the rows for validation
          } catch (error) {
            throw error;
          } finally {
            await client.end();
          }
        },
      });

      return config;
    },
    defaultCommandTimeout: 6000,
  },
});