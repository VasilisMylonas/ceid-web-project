import jwt from "jsonwebtoken";
import db from "../models/index.js";
import process from "process";

export default class AuthService {
  // Returns a JWT token if the username and password are correct, null otherwise
  static async login(username, password) {
    const user = await db.User.findOne({
      where: { username: username },
    });

    if (!user) {
      return null;
    }

    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return null;
    }

    console.info(`User ${user.username} logged in successfully.`);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.info("Token generated:", token);
    return token;
  }

  // Returns the user if the token is valid, null otherwise
  static async verifyToken(token) {
    try {
      if (!token) {
        return null;
      }

      console.info("Token received:", token);
      const id = jwt.verify(token, process.env.JWT_SECRET).id;
      if (!id) {
        return null;
      }

      const user = await db.User.findByPk(id);
      if (!user) {
        return null;
      }

      console.info(`Authenticated user ${user.id} (${user.role})`);
      return user;
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  }
}
