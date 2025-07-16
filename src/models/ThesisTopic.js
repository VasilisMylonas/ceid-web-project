import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const ThesisTopic = sequelize.define("ThesisTopic", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  professorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default ThesisTopic;
