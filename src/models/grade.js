import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Grade extends Model {
    static associate(models) {
      Grade.belongsTo(models.Professor, { foreignKey: "professorId" });
      Grade.belongsTo(models.Thesis, { foreignKey: "thesisId" });
    }
  }

  Grade.init(
    {
      professorId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      thesisId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      value: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      transcriptFile: {
        type: DataTypes.STRING,
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
