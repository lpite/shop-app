import {
  DataTypes,
  InferCreationAttributes,
  CreationOptional,
  InferAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../lib/sequelize";

interface SaleDocumentModel
  extends Model<
    InferAttributes<SaleDocumentModel>,
    InferCreationAttributes<SaleDocumentModel>
  > {
  document_id: CreationOptional<number>;
  isPosted: boolean;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

export const saleDocumentModel = sequelize.define<SaleDocumentModel>(
  "SaleDocument",
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
    tableName: "sale_document",
    timestamps: true,
  }
);
