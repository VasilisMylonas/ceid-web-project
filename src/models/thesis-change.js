import { DataTypes, Model } from "sequelize";
import { ThesisStatus } from "../constants.js";

export default (sequelize) => {
  class ThesisChange extends Model {
    static associate(models) {
      ThesisChange.belongsTo(models.Thesis, { foreignKey: "thesisId" });
    }
  }

  ThesisChange.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      thesisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      oldStatus: {
        type: DataTypes.ENUM(...Object.values(ThesisStatus)),
        allowNull: true,
      },
      newStatus: {
        type: DataTypes.ENUM(...Object.values(ThesisStatus)),
        allowNull: false,
      },
      changedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: false,
    }
  );

  return ThesisChange;
};
