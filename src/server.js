import app from "./app.js";
import db from "./models/index.js";

try {
  await db.sequelize.authenticate();
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database error:", error);
  process.exit(1);
}

await db.sequelize.sync({ alter: true });
// await db.sequelize.sync({ force: true }); // TODO: Remove in final version
console.log("Database synchronized successfully");

// await seedData();
// console.log("Data seeded successfully");

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default server;
