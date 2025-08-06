import User from "./user.js";
import Topic from "./topic.js";
import Professor from "./professor.js";
import Student from "./student.js";
import Secretary from "./secretary.js";
import Note from "./note.js";
import Thesis from "./thesis.js";
import Presentation from "./presentation.js";
import Material from "./material.js";
import Grade from "./grade.js";
import Invitation from "./invitation.js";

Professor.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Professor, { foreignKey: "id" }); // may-be-a

Student.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Student, { foreignKey: "id" }); // may-be-a

Secretary.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Secretary, { foreignKey: "id" }); // may-be-a

Note.belongsTo(Thesis, { foreignKey: "thesis" });
Thesis.hasMany(Note, { foreignKey: "thesis" });

Presentation.belongsTo(Thesis, { foreignKey: "thesis" });
Thesis.hasMany(Presentation, { foreignKey: "thesis" });

Material.belongsTo(Thesis, { foreignKey: "thesis" });
Thesis.hasMany(Material, { foreignKey: "thesis" });

Grade.belongsTo(Thesis, { foreignKey: "thesis" });
Thesis.hasMany(Grade, { foreignKey: "thesis" });

Topic.belongsTo(Professor, { foreignKey: "professor" });
Professor.hasMany(Topic, { foreignKey: "professor" });

Note.belongsTo(Professor, { foreignKey: "professor" });
Professor.hasMany(Note, { foreignKey: "professor" });

Thesis.belongsTo(Topic, { foreignKey: "topic" });
Topic.hasMany(Thesis, { foreignKey: "topic" });

Grade.belongsTo(Professor, { foreignKey: "professor" });
Professor.hasMany(Grade, { foreignKey: "professor" });

Thesis.belongsTo(Student, { foreignKey: "student" });
Student.hasMany(Thesis, { foreignKey: "student" });

Invitation.belongsTo(Student, { foreignKey: "student" });
Student.hasMany(Invitation, { foreignKey: "student" });

Invitation.belongsTo(Professor, { foreignKey: "professor" });
Professor.hasMany(Invitation, { foreignKey: "professor" });

// TODO
Invitation.belongsTo(Thesis, { foreignKey: "thesis" });
Thesis.hasMany(Invitation, { foreignKey: "thesis" });

// TODO: thesis assignment
// Committe members


export { User, Topic, Professor, Student, Secretary };
