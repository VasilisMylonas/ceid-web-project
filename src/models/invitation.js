import { InvitationStatus } from "../constants.js";
import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const Invitation = sequelize.define("Invitation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  response: {
    type: DataTypes.ENUM(...Object.values(InvitationStatus)),
    allowNull: false,
    defaultValue: InvitationStatus.PENDING,
  },
  responseDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Invitation;
