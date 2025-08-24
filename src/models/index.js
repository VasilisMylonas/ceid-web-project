import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import process from "process";
import configs from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = configs[process.env.NODE_ENV];
const db = {};

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

const files = fs
  .readdirSync(__dirname)
  .filter((f) => f.endsWith(".js") && f !== path.basename(__filename));

for (const file of files) {
  const module = await import(path.join(__dirname, file));
  const model = module.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
