import { NotFoundError } from "../errors.js";
import db from "../models/index.js";
import ThesisService from "../services/thesis.service.js";
import { ThesisRole } from "../constants.js";

export default class ResourceController {
  static async _assertResourceAccess(id, user, roles) {
    const resource = await db.Resource.findByPk(id);

    if (!resource) {
      throw new NotFoundError("Resource not found");
    }

    await ThesisService._assertUserHasThesisRoles(
      resource.thesisId,
      user,
      roles
    );

    return resource;
  }

  static async get(req, res) {
    const resource = await ResourceController._assertResourceAccess(
      req.params.id,
      req.user,
      [ThesisRole.STUDENT, ThesisRole.SUPERVISOR, ThesisRole.COMMITTEE_MEMBER]
    );

    return res.success(resource);
  }

  static async delete(req, res) {
    const resource = await ResourceController._assertResourceAccess(
      req.params.id,
      req.user,
      [ThesisRole.STUDENT]
    );

    await resource.destroy();
    return res.success();
  }

  static async put(req, res) {
    const resource = await ResourceController._assertResourceAccess(
      req.params.id,
      req.user,
      [ThesisRole.STUDENT]
    );

    await resource.destroy(req.body);
    return res.success(req.resource);
  }
}
