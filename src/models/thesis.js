import { sequelize } from "../config/database.js";
import { DataTypes, Model } from "sequelize";
import CommitteeMember from "./committee-member.js";

class Thesis extends Model {
  static async createFrom(params) {
    const { topic, student } = params;

    if (await topic.isAssigned()) {
      throw new Error("Topic is already assigned to a student.");
    }

    if (await student.isAssigned()) {
      throw new Error("Student is already assigned to a thesis.");
    }

    const thesis = await Thesis.create({
      topicId: topic.id,
      studentId: student.id,
      startDate: new Date(),
      status: "under_assignment",
    });

    // Automatically assign the professor as a supervisor
    await CommitteeMember.create({
      thesisId: thesis.id,
      professorId: topic.professorId,
      role: "supervisor",
    });

    return thesis;
  }
}

Thesis.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nemertesLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    protocolNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    statusReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "under_assignment",
        "pending",
        "approved",
        "rejected",
        "completed",
        "cancelled",
        "under_examination"
      ),
      allowNull: false,
      defaultValue: "under_assignment",
    },
  },
  { sequelize, modelName: "Thesis" }
);

export default Thesis;
