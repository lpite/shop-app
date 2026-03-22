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
import { ErrorBoundary } from "react-error-boundary";
import { TestPage } from "./pages/test-page.tsx";

const PriceChanger = lazy(() => import("./pages/PriceChanger.tsx"));
const StatsPage = lazy(() => import("./pages/StatsPage.tsx"));
const LeftOversReport = lazy(() => import("./pages/LeftoversReport.tsx"));
const ReportsPage = lazy(() => import("./pages/Reports.tsx"));
const PlaceChangeSuggestionReport = lazy(
	() => import("./pages/PlaceChangeSuggestionReport.tsx"),
);
const IncomeDocumentHelper = lazy(
	() => import("./pages/IncomeDocumentHelper.tsx"),
);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ErrorBoundary
			fallback={
				<div
					onClick={() => location.reload()}
					className="w-full h-full flex items-center justify-center flex-col gap-6"
				>
					<span className="text-3xl">Сталася помилка</span>
					<img className="w-24" src="/Sad_mac.jpg" />
					<span>Натисніть куди завгодно для оновлення</span>
				</div>
			}
		>
			<SWRConfig value={{ provider: () => new Map() }}>
				<OrderNotifier />
				<Switch>
					<Route path="/" component={StartPage} />
					<Route path="/clients/" component={ClientSelectionPage} />
					<Route path="/pos/:partnerId/:type" component={PosPage} />
					<Route path="/price-changer/" component={PriceChanger} />
					<Route
						path="/stats/"
						component={() => (
							<Suspense fallback={<Spinner size={40} />}>
								<StatsPage />
							</Suspense>
						)}
					/>
					<Route path="/report" component={ReportsPage} />
					<Route path="/report/leftovers" component={LeftOversReport} />
					<Route
						path="/report/place-change-suggestions"
						component={PlaceChangeSuggestionReport}
					/>
					<Route path="/config/" component={ConfigPage} />
					<Route
						path="/document-helper/income"
						component={IncomeDocumentHelper}
						nest
					/>
					<Route path="/test" component={TestPage} />
				</Switch>
			</SWRConfig>
		</ErrorBoundary>
	</StrictMode>,
);
