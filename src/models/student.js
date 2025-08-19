import { sequelize } from "../config/database.js";
import { Model, DataTypes } from "sequelize";

class Student extends Model {
  async isAssigned() {
    const theses = await this.getTheses({
      where: { endDate: null },
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
