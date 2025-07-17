import User from "./user.js";
import Topic from "./topic.js";
import Professor from "./professor.js";
import Student from "./student.js";
import Secretary from "./secretary.js";

Professor.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Professor, { foreignKey: "id" }); // may-be-a

Student.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Student, { foreignKey: "id" }); // may-be-a

Secretary.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Secretary, { foreignKey: "id" }); // may-be-a

Topic.belongsTo(Professor, { foreignKey: "professor" });
Professor.hasMany(Topic, { foreignKey: "professor" });

export { User, Topic, Professor, Student, Secretary };
