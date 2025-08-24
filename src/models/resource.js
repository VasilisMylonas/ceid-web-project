import { DataTypes, Model } from "sequelize";
import { ResourceKind } from "../constants.js";

export default (sequelize) => {
  class Resource extends Model {
    static associate(models) {
      Resource.belongsTo(models.Thesis, { foreignKey: "thesisId" });
    }
  }

  Resource.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(ResourceKind)),
        allowNull: false,
        defaultValue: ResourceKind.OTHER,
      },
      thesisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Resource",
      underscored: true,
    }
  );

  return Resource;
};
