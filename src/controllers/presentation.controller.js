export default class PresentationController {
  static async get(req, res) {
    return res.success(req.presentation);
  }
  static async delete(req, res) {
    await req.presentation.destroy();
    return res.success();
  }
  static async put(req, res) {
    await req.presentation.update(req.body);
    return res.success(req.presentation);
  }
}
