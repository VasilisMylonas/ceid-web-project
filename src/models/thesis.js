import { DataTypes, Model } from "sequelize";
import { ThesisGradingStatus, ThesisStatus } from "../constants.js";
import { deleteIfExists } from "../config/file-storage.js";

export default (sequelize) => {
  class Thesis extends Model {
    static associate(models) {
      Thesis.belongsTo(models.Topic, { foreignKey: "topicId" });
      Thesis.belongsTo(models.Student, { foreignKey: "studentId" });
      Thesis.hasMany(models.Note, { foreignKey: "thesisId" });
      Thesis.hasMany(models.Presentation, { foreignKey: "thesisId" });
      Thesis.hasMany(models.Resource, { foreignKey: "thesisId" });
      Thesis.hasMany(models.CommitteeMember, { foreignKey: "thesisId" });
      Thesis.hasMany(models.Invitation, { foreignKey: "thesisId" });
      Thesis.hasMany(models.ThesisTimeline, { foreignKey: "thesisId" });

      Thesis.belongsToMany(models.Professor, {
        through: models.CommitteeMember,
        foreignKey: "thesisId",
        otherKey: "professorId",
      });
    }

    async canBeDeleted() {
      return this.status === ThesisStatus.UNDER_ASSIGNMENT;
    }
  }

  Thesis.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      documentFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      grade: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      nemertesLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      protocolNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      // TODO: cancellation data maybe should be in JSON column, make sure to check custom queries in thesis.service.js
      assemblyYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      assemblyNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cancellationReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ThesisStatus)),
        allowNull: false,
        defaultValue: ThesisStatus.UNDER_ASSIGNMENT,
      },
      grading: {
        type: DataTypes.ENUM(...Object.values(ThesisGradingStatus)),
        allowNull: false,
        defaultValue: ThesisGradingStatus.DISABLED,
      },
    },
    {
      sequelize,
      underscored: true,
      indexes: [
        {
          fields: ["topic_id"],
        },
        {
          fields: ["student_id"],
        },
        {
          fields: ["status"],
        },
      ],
      hooks: {
        async beforeDestroy(thesis) {
          deleteIfExists(thesis.documentFile);
        },
      },
    }
  );

  return Thesis;
};
