import { DataTypes, Optional } from "sequelize";

import {
  Column,
  CreatedAt,
  Table,
  UpdatedAt,
  Model,
  HasMany,
} from "sequelize-typescript";
import {
  DocumentProductModel,
  incomeDocumentProductModel,
} from "./documentProduct";

interface IncomeDocument {
  document_id: number;
  isPosted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IncomeDocumentCreationAttributes
  extends Optional<IncomeDocument, "document_id" | "createdAt" | "updatedAt"> {}

@Table({
  tableName: "income_document",
})
export class incomeDocumentModel extends Model<
  IncomeDocument,
  IncomeDocumentCreationAttributes
> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
  })
  document_id!: number;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
  })
  isPosted!: boolean;

  @CreatedAt
  @Column
  createdAt!: Date;

  @UpdatedAt
  @Column
  updatedAt!: Date;

  @HasMany(() => incomeDocumentProductModel)
  products?: DocumentProductModel[];
}