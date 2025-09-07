import { StatusCodes } from "http-status-codes";

export default class ResourceController {
  static async get(req, res) {
    res.status(StatusCodes.OK).json(req.resource);
  }
  static async delete(req, res) {
    await req.resource.destroy();
    res.status(StatusCodes.NO_CONTENT).send();
  }
  static async put(req, res) {
    await req.resource.update(req.body);
    res.status(StatusCodes.OK).json(req.resource);
  }
}
