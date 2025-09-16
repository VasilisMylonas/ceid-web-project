export default class NoteController {
  static async get(req, res) {
    res.success(req.note);
  }

  static async delete(req, res) {
    await req.note.destroy();
    res.success();
  }

  static async put(req, res) {
    req.note.update(req.body);
    res.success(req.note);
  }
}
