import { Sequelize } from "sequelize";

const isTestEnv = process.env.NODE_ENV == "test";

export let sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  storage: isTestEnv ? ":memory:" : undefined,
  logging: false,
});
