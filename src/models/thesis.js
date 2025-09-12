import { DataTypes, Model } from "sequelize";
import { ThesisRole, ThesisStatus } from "../constants.js";

export default (sequelize) => {
  class Thesis extends Model {
    static associate(models) {
      Thesis.belongsTo(models.Topic, { foreignKey: "topicId" });
      Thesis.belongsTo(models.Student, { foreignKey: "studentId" });
      Thesis.hasMany(models.Note, { foreignKey: "thesisId" });
      Thesis.hasMany(models.Presentation, { foreignKey: "thesisId" });
      Thesis.hasMany(models.Resource, { foreignKey: "thesisId" });
      Thesis.hasMany(models.Grade, { foreignKey: "thesisId" });
      Thesis.hasMany(models.CommitteeMember, { foreignKey: "thesisId" });
      Thesis.hasMany(models.Invitation, { foreignKey: "thesisId" });

      Thesis.belongsToMany(models.Professor, {
        through: models.CommitteeMember,
        foreignKey: "thesisId",
        otherKey: "professorId",
      });
    }

    static async createFrom(params) {
      const { topic, student } = params;

      if (await topic.isAssigned()) {
        throw new Error("Topic is already assigned to a student.");
      }

      if (await student.isAssigned()) {
        throw new Error("Student is already assigned to a thesis.");
      }

      const thesis = await Thesis.create({
        topicId: topic.id,
        studentId: student.id,
        startDate: new Date(),
        status: ThesisStatus.UNDER_ASSIGNMENT,
      });

      const { CommitteeMember } = sequelize.models;

      // Automatically assign the professor as a supervisor
      await CommitteeMember.create({
        thesisId: thesis.id,
        professorId: topic.professorId,
        role: ThesisRole.SUPERVISOR,
      });

      return thesis;
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
      nemertesLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      protocolNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      statusReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ThesisStatus)),
        allowNull: false,
        defaultValue: ThesisStatus.UNDER_ASSIGNMENT,
      },
      grading: {
        type: DataTypes.ENUM("enabled", "disabled"),
        allowNull: false,
        defaultValue: "disabled",
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
    }
  );

  return Thesis;
};
