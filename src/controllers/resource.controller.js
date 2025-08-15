import { StatusCodes } from "http-status-codes";

export async function getResource(req, res) {
  res.status(StatusCodes.OK).json(req.resource);
}

export async function deleteResource(req, res) {
  await req.resource.destroy();
  res.status(StatusCodes.NO_CONTENT).send();
}

export async function patchResource(req, res) {
  await req.resource.update(req.body);
  res.status(StatusCodes.OK).json(req.resource);
}
