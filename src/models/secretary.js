import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Secretary extends Model {
    static associate(models) {
      Secretary.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

  Secretary.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Secretary",
    }
  );

  return Secretary;
};
