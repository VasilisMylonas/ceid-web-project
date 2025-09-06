import api from "./api.js";
import db from "./models/index.js";

import seedDatabase from "./seeders/index.js";

try {
  await db.sequelize.authenticate();
  // await seedDatabase();
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database error:", error);
  process.exit(1);
}

// Start server
const server = api.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default server;
