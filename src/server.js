import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

// import { seedData } from "./seeders.js";
// await sequelize.sync({ force: true }); // TODO: Remove in final version
// console.log("Database synchronized successfully");
// await seedData();
// console.log("Data seeded successfully");

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default server;
