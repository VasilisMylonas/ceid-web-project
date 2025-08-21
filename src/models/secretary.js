import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Secretary extends Model {
    static associate(models) {
      Secretary.belongsTo(models.User, { foreignKey: "id" });
    }
  }

  Secretary.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "Secretary",
    }
  );

  return Secretary;
};
