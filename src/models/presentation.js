import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Presentation = sequelize.define("Presentation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kind: {
    type: DataTypes.ENUM("online", "in-person"),
    allowNull: false,
  },
  hall: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Presentation;
