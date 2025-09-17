import { DataTypes, Model, Op } from "sequelize";
import { ThesisStatus } from "../constants.js";
import { ConflictError } from "../errors.js";
import { deleteIfExists } from "../config/file-storage.js";

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
              ThesisStatus.ACTIVE,
              ThesisStatus.COMPLETED,
              ThesisStatus.UNDER_EXAMINATION,
            ],
          },
        },
      });

      return theses.length > 0;
    }
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
      underscored: true,
      indexes: [
        {
          fields: ["professor_id"],
        },
        {
          fields: ["title"],
          type: "FULLTEXT",
        },
      ],
      hooks: {
        beforeUpdate: async (topic) => {
          if (await this.isAssigned()) {
            throw new ConflictError("Cannot modify an assigned topic");
          }

          if (topic.changed("descriptionFile")) {
            deleteIfExists(topic.previous("descriptionFile"));
          }
        },
      },
    }
  );

  return Topic;
};
