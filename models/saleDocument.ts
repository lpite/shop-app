import { DataTypes, Optional } from "sequelize";

import {
  Column,
  CreatedAt,
  Model,
  Table,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import {
  DocumentProductModel,
  saleDocumentProductModel,
} from "./documentProduct";
export interface SaleDocument {
  document_id: number;
  isPosted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SaleDocumentModelCreationAttributes
  extends Optional<SaleDocument, "document_id" | "createdAt" | "updatedAt"> {}

@Table({
  tableName: "sale_document",
})
export class saleDocumentModel extends Model<
  SaleDocument,
  SaleDocumentModelCreationAttributes
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

  @HasMany(() => saleDocumentProductModel)
  products?: DocumentProductModel[];
}
