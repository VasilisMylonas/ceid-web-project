import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
import { DataTypes, Model } from "sequelize";
import { ThesisStatus } from "../constants.js";

class Topic extends Model {
  async isAssigned() {
    const theses = await this.getTheses({
      where: {
        status: {
          [Op.in]: [
            ThesisStatus.UNDER_ASSIGNMENT,
            ThesisStatus.PENDING,
            ThesisStatus.APPROVED,
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

  // TODO
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
  },
  { sequelize, modelName: "Topic" }
);

export default Topic;
