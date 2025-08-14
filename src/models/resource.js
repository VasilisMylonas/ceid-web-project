import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Resource = sequelize.define("Resource", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("pdf", "video", "audio", "image", "other"),
    allowNull: false,
  },
});

export default Resource;
