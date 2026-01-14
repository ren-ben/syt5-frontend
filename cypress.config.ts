import { defineConfig } from "cypress";
import pg from "pg";

export default defineConfig({
  reporter: "cypress-mochawesome-reporter",
  experimentalStudio: true,
  video: true,

  e2e: {
    specPattern: "cypress/e2e/*.cy.ts",
    baseUrl: "http://localhost:5173",

    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);

      on("task", {
        async queryDB(query) {
          const client = new pg.Client({
            user: config.env.DB_USER || "postgres",
            password: config.env.DB_PASSWORD || "postgres",
            host: config.env.DB_HOST || "localhost",
            database: config.env.DB_NAME || "venlab",
            port: Number(config.env.DB_PORT || 5432),
          });

          await client.connect();
          try {
            const res = await client.query(query);
            return res.rows;
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
