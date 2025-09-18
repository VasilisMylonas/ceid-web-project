import InvitationService from "../services/invitation.service.js";

export default class InvitationController {
  static async putResponse(req, res) {
    const invitation = await InvitationService.respond(
      req.params.id,
      req.user,
      req.body.response
    );
    res.success(invitation);
  }

  static async delete(req, res) {
    await InvitationService.delete(req.params.id, req.user);
    res.success();
  }
}
