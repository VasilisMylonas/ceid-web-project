import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Grade extends Model {
    static associate(models) {
      Grade.belongsTo(models.CommitteeMember, {
        foreignKey: "committeeMemberId",
      });
    }
  }

  Grade.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      committeeMemberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      objectives: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      duration: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      deliverableQuality: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      presentationQuality: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: true,
    }
  );

  return Grade;
};
