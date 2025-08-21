import { DataTypes, Model } from "sequelize";
import { ThesisRole } from "../constants.js";

export default (sequelize) => {
  class CommitteeMember extends Model {
    static associate(models) {
      CommitteeMember.belongsTo(models.Thesis, { foreignKey: "thesisId" });
      CommitteeMember.belongsTo(models.Professor, {
        foreignKey: "professorId",
      });
    }
  }

  CommitteeMember.init(
    {
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
        type: DataTypes.ENUM(
          ThesisRole.COMMITTEE_MEMBER,
          ThesisRole.SUPERVISOR
        ),
        allowNull: false,
        defaultValue: ThesisRole.COMMITTEE_MEMBER,
      },
    },
    {
      sequelize,
      modelName: "CommitteeMember",
    }
  );

  return CommitteeMember;
};
