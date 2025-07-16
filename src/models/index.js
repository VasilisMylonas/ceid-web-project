import User from "./User.js";
import Topic from "./ThesisTopic.js";
import Professor from "./Professor.js";
import Student from "./Student.js";
import Secretary from "./Secretary.js";

Professor.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Professor, { foreignKey: "id" }); // may-be-a

Student.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Student, { foreignKey: "id" }); // may-be-a

Secretary.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Secretary, { foreignKey: "id" }); // may-be-a

Topic.belongsTo(Professor, { foreignKey: "professorId" });
Professor.hasMany(Topic, { foreignKey: "professorId" });

export { User, Topic, Professor, Student, Secretary };
