import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Announcement extends Model {
    static associate(models) {
      Announcement.belongsTo(models.Thesis, { foreignKey: "thesisId" });
    }
  }

  Announcement.init(
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
      content: {
        type: DataTypes.TEXT,
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
