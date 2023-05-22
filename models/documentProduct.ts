import { DataTypes } from "sequelize";

import {
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { incomeDocumentModel } from "./incomeDocument";
import { productModel } from "./product";
import { saleDocumentModel } from "./saleDocument";

export interface DocumentProductModel {
  document_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

@Table({
  tableName: "document_product",
  timestamps: false,
})
class documentProductModel extends Model<DocumentProductModel> {
  @ForeignKey(() => productModel)
  @Column
  product_id!: number;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataTypes.REAL,
  })
  price!: number;

  @Column({
    type: DataTypes.REAL,
  })
  quantity!: number;
}

@Table({
  tableName: "sale_document_product",
})
export class saleDocumentProductModel extends documentProductModel {
  @ForeignKey(() => saleDocumentModel)
  @Column
  document_id!: number;
}
@Table({
  tableName: "income_document_product",
})
export class incomeDocumentProductModel extends documentProductModel {
  @ForeignKey(() => incomeDocumentModel)
  @Column
  document_id!: number;
}
