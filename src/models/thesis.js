import { DataTypes, Model } from "sequelize";
import { ThesisGradingStatus, ThesisStatus } from "../constants.js";
import { deleteIfExists } from "../config/file-storage.js";
import { ConflictError } from "../errors.js";

function checkStatusTransition(thesis) {
  const oldStatus = thesis.previous("status");
  const newStatus = thesis.status;

  switch (newStatus) {
    case ThesisStatus.CANCELLED:
      if (oldStatus !== ThesisStatus.ACTIVE) {
        throw new ConflictError("Thesis cannot be cancelled at this stage.");
      }
      break;

    case ThesisStatus.UNDER_EXAMINATION:
      if (oldStatus !== ThesisStatus.ACTIVE) {
        throw new ConflictError(
          "Thesis cannot be set under examination at this stage."
        );
      }
      if (thesis.protocolNumber === null) {
        throw new ConflictError(
          "Thesis cannot be set under examination without a protocol number."
        );
      }
      break;

    case ThesisStatus.COMPLETED:
      if (oldStatus !== ThesisStatus.UNDER_EXAMINATION) {
        throw new ConflictError("Thesis cannot be completed at this stage.");
      }
      if (thesis.grade === null || thesis.nemertesLink === null) {
        throw new ConflictError(
          "Thesis cannot be completed without grade and nemertes link."
        );
      }
      break;

    case ThesisStatus.ACTIVE:
      if (oldStatus !== ThesisStatus.UNDER_ASSIGNMENT) {
        throw new ConflictError("Thesis cannot be set active at this stage.");
      }
      break;

    case ThesisStatus.UNDER_ASSIGNMENT:
      throw new ConflictError("Thesis cannot be reverted to under assignment.");
  }
}

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
      Thesis.hasMany(models.ThesisChange, { foreignKey: "thesisId" });
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
      assemblyNumber: {
        type: DataTypes.STRING,
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
          // Delete the file physically
          deleteIfExists(thesis.documentFile);
        },
        async beforeUpdate(thesis) {
          if (
            thesis.changed("grade") &&
            thesis.status !== ThesisStatus.COMPLETED
          ) {
            throw new ConflictError(
              "Cannot set grade until thesis is completed."
            );
          }

          // Check if status transition is valid
          if (thesis.changed("status")) {
            checkStatusTransition(thesis);
          }

          // Prevent changing nemertesLink if not in UNDER_EXAMINATION state
          if (
            thesis.changed("nemertesLink") &&
            thesis.status !== ThesisStatus.UNDER_EXAMINATION
          ) {
            throw new ConflictError("Thesis is not under examination.");
          }

          // Prevent changing grading status if not in UNDER_EXAMINATION state
          if (
            thesis.changed("grading") &&
            thesis.status !== ThesisStatus.UNDER_EXAMINATION
          ) {
            throw new ConflictError("Thesis is not under examination.");
          }

          if (thesis.changed("documentFile")) {
            // Prevent changing documentFile if not in ACTIVE state
            if (thesis.status !== ThesisStatus.ACTIVE) {
              throw new ConflictError("Thesis is not active.");
            }

            // Delete the previous file physically
            deleteIfExists(thesis.previous("documentFile"));
          }

          if (thesis.changed("status")) {
            await thesis.createThesisChange({
              oldStatus: thesis.previous("status"),
              newStatus: thesis.status,
              changedAt: new Date(),
            });
          }
        },
      },
    }
  );

  return Thesis;
};
