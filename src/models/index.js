import User from "./User.js";
import Topic from "./Topic.js";
import Professor from "./Professor.js";

Topic.belongsTo(Professor, { foreignKey: "professorId" });
Professor.belongsTo(User, { foreignKey: "userId" });

export { User, Topic, Professor };
