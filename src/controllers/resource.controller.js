export default class ResourceController {
  static async get(req, res) {
    return res.success(req.resource);
  }
  static async delete(req, res) {
    await req.resource.destroy();
    return res.success();
  }
  static async put(req, res) {
    await req.resource.update(req.body);
    return res.success(req.resource);
  }
}
