import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import db from "./models/index.js";
import process from "process";

const models = Object.values(db).filter((model) => model !== db.sequelize);

AdminJS.registerAdapter(AdminJSSequelize);

const adminJs = new AdminJS({
  resources: models.map((model) => {
    return {
      resource: model,
      options: {},
    };
  }),
  rootPath: "/admin",
});

const adminPanel = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
  authenticate: async (email, password) => {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return { email: process.env.ADMIN_EMAIL };
    }
    return null;
  },
  cookieName: process.env.ADMINJS_COOKIE_NAME,
  cookiePassword: process.env.ADMINJS_COOKIE_PASSWORD,
});

export default adminPanel;
