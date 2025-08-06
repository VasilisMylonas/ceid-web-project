import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Invitation = sequelize.define("Invitation", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    response: {
        type: DataTypes.ENUM("accepted", "declined", "pending"),
        allowNull: false,
    },
    responseDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

export default Invitation;
