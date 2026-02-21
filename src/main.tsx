import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { Route, Switch } from "wouter";

import "./index.css";

import PosPage from "./pages/PosPage.tsx";
import StartPage from "./pages/StartPage.tsx";
import ClientSelectionPage from "./pages/ClientSelectionPage.tsx";
import { ConfigPage } from "./pages/Config.tsx";

import { Spinner } from "./components/spinner.tsx";
import { OrderNotifier } from "./components/order-notification";

const PriceChanger = lazy(() => import("./pages/PriceChanger.tsx"));
const Test2 = lazy(() => import("./pages/Test2.tsx"));
const StatsPage = lazy(() => import("./pages/StatsPage.tsx"));
const LeftOversReport = lazy(() => import("./pages/LeftoversReport.tsx"));
const CategoryEditor = lazy(() => import("./pages/CategoryEditor.tsx"));
const PosExperiment = lazy(() => import("./pages/PosExperiment.tsx"));
const ReportsPage = lazy(() => import("./pages/Reports.tsx"));
const SearchByVin = lazy(() => import("./pages/SearchByVin.tsx"));
const FiltersDemo = lazy(() => import("./pages/filters-demo.tsx"));
const SuppliersSearch = lazy(() => import("./pages/SuppliersSearch.tsx"));
const IncomeDocumentHelper = lazy(
	() => import("./pages/IncomeDocumentHelper.tsx"),
);
const TestPage = lazy(() => import("./pages/Test.tsx"));

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SWRConfig value={{ provider: () => new Map() }}>
			<OrderNotifier />
			<Switch>
				<Route path="/" component={StartPage} />
				<Route path="/clients/" component={ClientSelectionPage} />
				<Route path="/pos-new/:partnerId/:type" component={PosExperiment} />
				<Route path="/pos/:partnerId/:type" component={PosPage} />
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
				<Route path="/report" component={ReportsPage} />
				<Route path="/report/leftovers" component={LeftOversReport} />
				<Route path="/category-editor/" component={CategoryEditor} />
				<Route path="/suppliers-search/" component={SuppliersSearch} />
				<Route path="/demo/" component={FiltersDemo} />
				<Route path="/vin-demo/" component={SearchByVin} />
				<Route path="/config/" component={ConfigPage} />
				<Route
					path="/document-helper/income"
					component={IncomeDocumentHelper}
					nest
				/>
			</Switch>
		</SWRConfig>
	</StrictMode>,
);
