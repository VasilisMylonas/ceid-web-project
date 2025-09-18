import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class ThesisTimeline extends Model {
    static associate(models) {
      ThesisTimeline.belongsTo(models.Thesis, { foreignKey: "thesisId" });
    }
  }

  ThesisTimeline.init(
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
      // Make sure we use the same type as in the Thesis model so we dont have issues with triggers
      oldStatus: {
        type: "enum_theses_status",
        allowNull: true,
      },
      newStatus: {
        type: "enum_theses_status",
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
      tableName: "thesis_timeline",
      hasTrigger: true,
    }
  );

  return ThesisTimeline;
};
