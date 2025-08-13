import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Topic = sequelize.define("Topic", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  descriptionFile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Topic;
