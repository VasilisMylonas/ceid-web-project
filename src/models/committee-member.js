import { ThesisRole } from "../constants.js";
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
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM(ThesisRole.COMMITTEE_MEMBER, ThesisRole.SUPERVISOR),
    allowNull: false,
    defaultValue: ThesisRole.COMMITTEE_MEMBER,
  },
});

export default CommitteeMember;
