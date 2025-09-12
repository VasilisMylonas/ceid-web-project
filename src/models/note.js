import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.Thesis, { foreignKey: "thesisId" });
      Note.belongsTo(models.Professor, { foreignKey: "professorId" });
    }
  }

  Note.init(
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
      thesisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      professorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: true,
    }
  );

  return Note;
};
