import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const CommitteeMember = sequelize.define("CommitteeMember", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

export default CommitteeMember;
