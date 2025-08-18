import { ResourceKind } from "../constants.js";
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
    type: DataTypes.ENUM(...Object.values(ResourceKind)),
    allowNull: false,
    defaultValue: ResourceKind.OTHER,
  },
});

export default Resource;
