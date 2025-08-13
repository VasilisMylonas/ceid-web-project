import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Grade = sequelize.define("Grade", {
  professorId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  thesisId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  grade: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  transcriptFile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Grade;
