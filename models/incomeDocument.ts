import {
  DataTypes,
  InferCreationAttributes,
  CreationOptional,
  InferAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../lib/sequelize";

interface IncomeDocumentModel
  extends Model<
    InferAttributes<IncomeDocumentModel>,
    InferCreationAttributes<IncomeDocumentModel>
  > {
  document_id: CreationOptional<number>;
  isPosted: boolean;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

export const incomeDocumentModel = sequelize.define<IncomeDocumentModel>(
  "IncomeDocument",
  {
    document_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    isPosted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "income_document",
    timestamps: true,
  }
);
