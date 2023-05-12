import { Route, Routes } from "@solidjs/router";
import type { Component } from "solid-js";
import Header from "./components/Header/Header";
import { HomePage } from "./pages/Home";
import IncomeDocument from "./pages/IncomeDocument";
import IncomeDocumentsPage from "./pages/IncomeDocumentsPage";
import Nomenclature from "./pages/Nomenclature";
import ProductPage from "./pages/ProductPage";
import SaleDocument from "./pages/SaleDocument";
import SaleDocuments from "./pages/SaleDocuments";
import SelectProducts from "./pages/SelectProducts";
import SetPrices from "./pages/SetPrices";

const App: Component = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" component={HomePage} />
        <Route path="/income" component={IncomeDocumentsPage} />
        <Route path="/income/:documentId" component={IncomeDocument} />
        <Route path="/sale" component={SaleDocuments} />
        <Route path="/sale/:documentId" component={SaleDocument} />
        <Route path="/nomenclature" component={Nomenclature} />
        <Route path="/product/:productId" component={ProductPage} />
        <Route path="/select-products/:type/:documentId" component={SelectProducts} />
        <Route path="/set-prices" component={SetPrices} />
      </Routes>
    </>
  );
};

export default App;
