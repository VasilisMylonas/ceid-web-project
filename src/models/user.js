import { UserRole } from "../constants.js";
import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Professor, { foreignKey: "userId" });
      User.hasOne(models.Student, { foreignKey: "userId" });
      User.hasOne(models.Secretary, { foreignKey: "userId" });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      underscored: true,
      indexes: [
        {
          fields: ["role"],
        },
        {
          unique: true,
          fields: ["username"],
        },
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );

  return User;
};
