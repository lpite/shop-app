import { sequelize } from "./sequelize";

type CountProductQuantity = {
  products: { product_id: number }[];
};

export default async function countProductQuantity({
  products,
}: CountProductQuantity) {
  const result: { [key: string]: number } = {};
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const [saleCount] =
      (await sequelize.query(`SELECT SUM(sale_document_product.quantity) as quantity FROM sale_document
        LEFT JOIN sale_document_product
        ON sale_document_product.document_id = sale_document.document_id
        WHERE sale_document.isPosted = true AND sale_document_product.product_id = ${product.product_id};`)) as {
        quantity: number | null;
      }[][];
    const [incomeCount] =
      (await sequelize.query(`SELECT SUM(income_document_product.quantity) as quantity FROM income_document
          LEFT JOIN income_document_product
          ON income_document_product.document_id = income_document.document_id
          WHERE income_document.isPosted = true AND income_document_product.product_id = ${product.product_id};`)) as {
        quantity: number | null;
      }[][];

    const count = (incomeCount[0].quantity || 0) - (saleCount[0].quantity || 0);
    result[product.product_id.toString()] = count;
  }

  return result;
}
