import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import db from "./models/index.js";

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

const adminPanel = AdminJSExpress.buildRouter(adminJs);
// adminPanel.use(adminJs.options.rootPath, AdminJSExpress.buildRouter(adminJs));

export default adminPanel;
