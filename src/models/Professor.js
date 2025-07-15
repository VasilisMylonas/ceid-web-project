import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const Professor = sequelize.define("Professor", {
  division: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Professor;
