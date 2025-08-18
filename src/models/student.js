import { sequelize } from "../config/database.js";
import { Model, DataTypes, Op } from "sequelize";

class Student extends Model {
  async isAssigned() {
    const theses = await this.getTheses({
      where: { endDate: null },
    });

    return theses.length > 0;
  }

  async search(query) {
    const { User } = sequelize.models;

    return await Student.findAll({
      where: {
        am: {
          [Op.like]: `%${query}%`,
        },
      },
      include: [
        {
          model: User,
          where: {
            [Op.or]: [{ name: { [Op.like]: `%${query}%` } }],
          },
          required: true,
        },
      ],
      limit: 10,
    });
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
