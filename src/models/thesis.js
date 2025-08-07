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
        allowNull: true,
    },
    nemertesLink: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    protocolNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    cancellationReason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "completed", "cancelled", "under_examination"),
        allowNull: false,
        defaultValue: "pending",
    }
});

export default Thesis;
