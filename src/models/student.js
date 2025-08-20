import { sequelize } from "../config/database.js";
import { Model, DataTypes, Op } from "sequelize";
import { ThesisStatus } from "../constants.js";

class Student extends Model {
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
}

Student.init(
  {
    am: {
      type: DataTypes.STRING,
    },
  },
  { sequelize, modelName: "Student" }
);

export default Student;
