import { DataTypes, Model } from "sequelize";
import { InvitationResponse } from "../constants.js";

export default (sequelize) => {
  class Invitation extends Model {
    static associate(models) {
      Invitation.belongsTo(models.Professor, { foreignKey: "professorId" });
      Invitation.belongsTo(models.Thesis, { foreignKey: "thesisId" });
    }
  }

  Invitation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      response: {
        type: DataTypes.ENUM(...Object.values(InvitationResponse)),
        allowNull: false,
        defaultValue: InvitationResponse.PENDING,
      },
      responseDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      professorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      thesisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Invitation",
    }
  );

  return Invitation;
};
