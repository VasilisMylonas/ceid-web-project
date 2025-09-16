import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  class Professor extends Model {
    static associate(models) {
      Professor.belongsTo(models.User, { foreignKey: "userId" });
      Professor.hasMany(models.Topic, { foreignKey: "professorId" });
      Professor.hasMany(models.Note, { foreignKey: "professorId" });
      Professor.hasMany(models.Invitation, { foreignKey: "professorId" });
      Professor.hasMany(models.CommitteeMember, { foreignKey: "professorId" });
      Professor.belongsToMany(models.Thesis, {
        through: models.CommitteeMember,
        foreignKey: "professorId",
        otherKey: "thesisId",
      });
    }
  }

  Professor.init(
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
      division: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: true,
    }
  );

  return Professor;
};
