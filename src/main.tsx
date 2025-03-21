import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Route, Switch } from "wouter";
import StartPage from "./pages/StartPage.tsx";
import DocumentPage from "./pages/DocumentPage.tsx";
import TestPage from "./pages/Test.tsx";
import SuppliersSearch from "./pages/SuppliersSearch.tsx";

const PriceChanger = lazy(() => import("./pages/PriceChanger.tsx"));
const Test2 = lazy(() => import("./pages/Test2.tsx"));
const ClientSelectionPage = lazy(
	() => import("./pages/ClientSelectionPage.tsx"),
);
const StatsPage = lazy(() => import("./pages/StatsPage.tsx"));
const Reports = lazy(() => import("./pages/Reports.tsx"));
const CategoryEditor = lazy(() => import("./pages/CategoryEditor.tsx"));

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Switch>
			<Route path="/" component={StartPage} />
			<Route
				path="/clients/"
				component={() => (
					<Suspense fallback="...">
						<ClientSelectionPage />
					</Suspense>
				)}
			/>
			<Route path="/document/:partnerId/:type" component={DocumentPage} />
			<Route path="/test" component={TestPage} />
			<Route path="/test2/" component={Test2} nest />
			<Route path="/price-changer/" component={PriceChanger} />
			<Route path="/stats/" component={StatsPage} />
			<Route path="/reports/" component={Reports} />
			<Route path="/category-editor/" component={CategoryEditor} />
			<Route path="/suppliers-search/" component={SuppliersSearch} />
		</Switch>
	</StrictMode>,
);
