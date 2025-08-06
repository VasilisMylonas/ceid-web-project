import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Note = sequelize.define("Note", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default Note;
