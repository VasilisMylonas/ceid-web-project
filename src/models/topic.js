import { sequelize } from "../config/database.js";
import { DataTypes, Model } from "sequelize";

class Topic extends Model {
  async isAssigned() {
    const theses = await this.getTheses({
      where: { endDate: null },
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
