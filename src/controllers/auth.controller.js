import { StatusCodes } from "http-status-codes";
import AuthService from "../services/auth.service.js";

export async function login(req, res) {
  const token = await AuthService.login(req.body.username, req.body.password);

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json();
  }

  res.success({ token });
}

export async function logout(req, res) {
  // WONTFIX
  res.error(
    "Logout not implemented, please clear the token on the client side. See https://jwt.io/ for more information.",
    StatusCodes.NOT_IMPLEMENTED
  );
}

export async function refresh(req, res) {
  // WONTFIX: Implement refresh token logic
  res.error("Refresh token not implemented yet.", StatusCodes.NOT_IMPLEMENTED);
}
