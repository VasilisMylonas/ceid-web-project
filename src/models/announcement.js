import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Announcement extends Model {
    static associate(models) {
      Announcement.belongsTo(models.Presentation, {
        foreignKey: "presentationId",
      });
    }
  }

  Announcement.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      presentationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: true,
    }
  );

  return Announcement;
};
