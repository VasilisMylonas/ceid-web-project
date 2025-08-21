import app from "./app.js";
import db from "./models/index.js";

import * as x from "./seeders/index.js";
console.log("Data seeded successfully");

try {
  await db.sequelize.authenticate();
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database error:", error);
  process.exit(1);
}

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default server;
