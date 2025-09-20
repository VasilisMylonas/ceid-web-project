import db from "../models/index.js";
import { SecurityError, NotFoundError } from "../errors.js";

export default class NoteController {
  static async _assertNoteAccess(id, user) {
    const note = await db.Note.findByPk(id);

    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const professor = await user.getProfessor();

    if (note.professorId !== professor.id) {
      throw new SecurityError("You do not have access to this note");
    }

    return note;
  }

  static async get(req, res) {
    const note = await NoteController._assertNoteAccess(
      req.params.id,
      req.user
    );
    res.success(note);
  }

  static async delete(req, res) {
    const note = await NoteController._assertNoteAccess(
      req.params.id,
      req.user
    );
    await note.destroy();
    res.success();
  }

  static async put(req, res) {
    const note = await NoteController._assertNoteAccess(
      req.params.id,
      req.user
    );
    await note.update(req.body);
    res.success(note);
  }
}
