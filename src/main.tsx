import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Route, Switch } from "wouter";
import StartPage from "./pages/StartPage.tsx";
import DocumentPage from "./pages/DocumentPage.tsx";

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
			{/*<Route path="/test" element={<TestPage />} />*/}
			<Route path="/test2/*" component={Test2} />
			<Route path="/price-changer/" component={PriceChanger} />
			<Route path="/stats/" component={StatsPage} />
			<Route path="/reports/" component={Reports} />
			<Route path="/category-editor/" component={CategoryEditor} />
		</Switch>
	</StrictMode>,
);
