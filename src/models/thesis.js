import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Thesis = sequelize.define("Thesis", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    documentFile: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nemertesLink: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    protocolNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    // TODO: status?
});

export default Thesis;
