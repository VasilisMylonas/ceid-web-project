import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Professor extends Model {
    static associate(models) {
      Professor.belongsTo(models.User, { foreignKey: "id" });
      Professor.hasMany(models.Topic, { foreignKey: "professorId" });
      Professor.hasMany(models.Note, { foreignKey: "professorId" });
      Professor.hasMany(models.Grade, { foreignKey: "professorId" });
      Professor.hasMany(models.Invitation, { foreignKey: "professorId" });
      Professor.hasMany(models.CommitteeMember, { foreignKey: "professorId" });
    }
  }

  Professor.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      division: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Professor",
    }
  );

  return Professor;
};
