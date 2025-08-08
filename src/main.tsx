import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Route, Switch } from "wouter";
import StartPage from "./pages/StartPage.tsx";
import DocumentPage from "./pages/DocumentPage.tsx";
import TestPage from "./pages/Test.tsx";
import SuppliersSearch from "./pages/SuppliersSearch.tsx";
import FiltersDemo from "./pages/filters-demo.tsx";
import { SWRConfig } from "swr";
import SearchByVin from "./pages/SearchByVin.tsx";
import { Spinner } from "./components/spinner.tsx";
import { IncomeDocumentHelper } from "./pages/IncomeDocumentHelper.tsx";
import ClientSelectionPage from "./pages/ClientSelectionPage.tsx";
import { OrderNotifier } from "./components/order-notification";

const PriceChanger = lazy(() => import("./pages/PriceChanger.tsx"));
const Test2 = lazy(() => import("./pages/Test2.tsx"));
const StatsPage = lazy(() => import("./pages/StatsPage.tsx"));
const Reports = lazy(() => import("./pages/Reports.tsx"));
const CategoryEditor = lazy(() => import("./pages/CategoryEditor.tsx"));

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SWRConfig value={{ provider: () => new Map() }}>
			<OrderNotifier />
			<Switch>
				<Route path="/" component={StartPage} />
				<Route path="/clients/" component={ClientSelectionPage} />
				<Route path="/document/:partnerId/:type" component={DocumentPage} />
				<Route path="/test" component={TestPage} />
				<Route path="/test2/" component={Test2} nest />
				<Route path="/price-changer/" component={PriceChanger} />
				<Route
					path="/stats/"
					component={() => (
						<Suspense fallback={<Spinner size={30} />}>
							<StatsPage />
						</Suspense>
					)}
				/>
				<Route path="/reports/" component={Reports} />
				<Route path="/category-editor/" component={CategoryEditor} />
				<Route path="/suppliers-search/" component={SuppliersSearch} />
				<Route path="/demo/" component={FiltersDemo} />
				<Route path="/vin-demo/" component={SearchByVin} />
				<Route
					path="/document-helper/income"
					component={IncomeDocumentHelper}
				/>
			</Switch>
		</SWRConfig>
	</StrictMode>,
);
