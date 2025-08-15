import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const CommitteeMember = sequelize.define("CommitteeMember", {
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
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("supervisor", "committee_member"),
    allowNull: false,
    defaultValue: "committee_member",
  },
});

export default CommitteeMember;
