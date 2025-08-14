import User from "./user.js";
import Topic from "./topic.js";
import Professor from "./professor.js";
import Student from "./student.js";
import Secretary from "./secretary.js";
import Note from "./note.js";
import Thesis from "./thesis.js";
import Presentation from "./presentation.js";
import Resource from "./resource.js";
import Grade from "./grade.js";
import Invitation from "./invitation.js";
import CommitteeMember from "./committee-member.js";

Professor.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Professor, { foreignKey: "id" }); // may-be-a

Student.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Student, { foreignKey: "id" }); // may-be-a

Secretary.belongsTo(User, { foreignKey: "id" }); // is-a
User.hasOne(Secretary, { foreignKey: "id" }); // may-be-a

Note.belongsTo(Thesis, { foreignKey: "thesisId" });
Thesis.hasMany(Note, { foreignKey: "thesisId" });

Presentation.belongsTo(Thesis, { foreignKey: "thesisId" });
Thesis.hasMany(Presentation, { foreignKey: "thesisId" });

Resource.belongsTo(Thesis, { foreignKey: "thesisId" });
Thesis.hasMany(Resource, { foreignKey: "thesisId" });

Topic.belongsTo(Professor, { foreignKey: "professorId" });
Professor.hasMany(Topic, { foreignKey: "professorId" });

Note.belongsTo(Professor, { foreignKey: "professorId" });
Professor.hasMany(Note, { foreignKey: "professorId" });

Thesis.belongsTo(Topic, { foreignKey: "topicId" });
Topic.hasMany(Thesis, { foreignKey: "topicId" });

Thesis.belongsTo(Student, { foreignKey: "studentId" });
Student.hasMany(Thesis, { foreignKey: "studentId" });

Grade.belongsTo(Professor, { foreignKey: "professorId" });
Professor.hasMany(Grade, { foreignKey: "professorId" });
Grade.belongsTo(Thesis, { foreignKey: "thesisId" });
Thesis.hasMany(Grade, { foreignKey: "thesisId" });

Invitation.belongsTo(Student, { foreignKey: "studentId" });
Student.hasMany(Invitation, { foreignKey: "studentId" });
Invitation.belongsTo(Professor, { foreignKey: "professorId" });
Professor.hasMany(Invitation, { foreignKey: "professorId" });

CommitteeMember.belongsTo(Thesis, { foreignKey: "thesisId" });
Thesis.hasMany(CommitteeMember, { foreignKey: "thesisId" });
CommitteeMember.belongsTo(Professor, { foreignKey: "professorId" });
Professor.hasMany(CommitteeMember, { foreignKey: "professorId" });

export {
  User,
  Topic,
  Professor,
  Student,
  Secretary,
  Note,
  Thesis,
  Presentation,
  Resource,
  Grade,
  Invitation,
  CommitteeMember,
};
