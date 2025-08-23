import { DataTypes, Model, Op } from "sequelize";
import { ThesisStatus } from "../constants.js";

export default (sequelize) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.User, { foreignKey: "id" });
      Student.hasMany(models.Thesis, { foreignKey: "studentId" });
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
  }

  Student.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      am: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Student",
    }
  );

  return Student;
};
