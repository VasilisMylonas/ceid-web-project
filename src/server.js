import app from "./app.js";
import { sequelize } from "./config/database.js";

try {
  await sequelize.authenticate();
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database error:", error);
  process.exit(1);
}

await sequelize.sync({ alter: true });
// await sequelize.sync({ force: true }); // TODO: Remove in final version
console.log("Database synchronized successfully");

// await seedData();
// console.log("Data seeded successfully");

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default server;
