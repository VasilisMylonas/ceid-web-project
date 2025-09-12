import { DataTypes, Model } from "sequelize";
import { PresentationKind } from "../constants.js";

export default (sequelize) => {
  class Presentation extends Model {
    static associate(models) {
      Presentation.belongsTo(models.Thesis, { foreignKey: "thesisId" });
    }
  }

  Presentation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      kind: {
        type: DataTypes.ENUM(...Object.values(PresentationKind)),
        allowNull: false,
      },
      hall: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      thesisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: true,
    }
  );

  return Presentation;
};
