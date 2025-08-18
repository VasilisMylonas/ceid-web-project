import { sequelize } from "../config/database.js";
import { Model } from "sequelize";

class Student extends Model {
  async isAssigned() {
    const theses = await this.getTheses({
      where: { endDate: null },
    });

    return theses.length > 0;
  }
}

Student.init({}, { sequelize, modelName: "Student" });

export default Student;
