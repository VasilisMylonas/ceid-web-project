import { DataTypes, Model, Op } from "sequelize";
import { ThesisStatus } from "../constants.js";

export default (sequelize) => {
  class Topic extends Model {
    static associate(models) {
      Topic.belongsTo(models.Professor, { foreignKey: "professorId" });
      Topic.hasMany(models.Thesis, { foreignKey: "topicId" });
    }

    async isAssigned() {
      const theses = await this.getTheses({
        where: {
          status: {
            [Op.in]: [
              ThesisStatus.UNDER_ASSIGNMENT,
              ThesisStatus.PENDING,
              ThesisStatus.ACTIVE,
              ThesisStatus.COMPLETED,
              ThesisStatus.UNDER_EXAMINATION,
            ],
          },
        },
      });

      return theses.length > 0;
    }

    async canModify() {
      return !(await this.isAssigned());
    }

    async canCancelAssignment() {}
  }

  Topic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      descriptionFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      professorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Topic",
      underscored: true,
    }
  );

  return Topic;
};
