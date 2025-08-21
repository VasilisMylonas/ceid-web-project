import db from "../models/index.js";
import fs from "fs";
import { UserRole } from "src/constants.js";

async function up() {
  var data = JSON.parse(fs.readFileSync("./data/professors.json"));

  data.forEach((professor, index) => {
    professor.password = "xxx";
    professor.phone = "000";
    professor.role = UserRole.PROFESSOR;
    professor.id = index + 1;
  });

  await db.User.bulkCreate(data, {
    fields: ["id", "username", "name", "email", "password", "phone", "role"],
  });

  await db.Professor.bulkCreate(data, {
    fields: ["id", "division"],
  });
}
