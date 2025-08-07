import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Grade = sequelize.define("Grade", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
