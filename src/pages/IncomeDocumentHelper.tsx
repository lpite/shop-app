import {
	Link,
	Route,
	Switch,
	useLocation,
	useParams,
	useSearchParams,
} from "wouter";
import { fetcher } from "../utils/fetcher";
import {
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	PenLine,
	Save,
	Trash,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ProductImport } from "../components/income-document-helper/product-import";
import Show from "../utils/Show";
import { DocumentInformation } from "../components/income-document-helper/document-information";
import { FinalStep } from "../components/income-document-helper/final-step";

const setIsPosted = (m: any) => true;

interface IncomeDocumentProduct {
	ref: string;
	price: number;
	quantity: number;
	name: string;
	selected?: boolean;
}

export interface IncomeDocument {
	number: string;
	date: string;
	posted: boolean;
	products: IncomeDocumentProduct[];
	comment: string;
	supplierRef: string;
	counterPartyRef: string;
	warehouseRef: string;
}

const STEPS = ["details", "import", "price", "final"];

export function IncomeDocumentHelper() {
	const { number, date } = useParams();
	const [_, navigate] = useLocation();

	const [allowEditing, setAllowEditing] = useState(false);
	const [document, setDocument] = useState<IncomeDocument>({
		products: [],
		number: "",
		date: "",
		posted: false,
		comment: "",
		supplierRef: "",
		counterPartyRef: "",
		warehouseRef: "",
	});

	function setDocumentProducts(products: IncomeDocument["products"]) {
		setDocument((d) => ({ ...d, products: products }));
	}
	const [searchParams] = useSearchParams();

	const [step, setStep] = useState(0);

	async function saveDocument() {
		const response = await fetcher<any>({
			method: "POST",
			url: "/shop/odata/standard.odata/Document_ПоступлениеТоваровУслуг?$format=json",
			body: {
				Date: new Date(),
				ДатаПлатежа: new Date(),
				Партнер_Key: document.supplierRef,
				Контрагент_Key: document.counterPartyRef,
				Склад_Key: document.warehouseRef,
				Подразделение_Key: "04dec983-6247-11e3-9715-00e04c395324", // склад
				Комментарий: document.comment,
				Товары: document.products.map((el, i) => ({
					Номенклатура_Key: el.ref,
					Количество: el.quantity,
					КоличествоУпаковок: el.quantity,
					Склад_Key: "37b78b0d-25ac-11e3-874f-00e04c395324",
					ВидЗапасов_Key: "fdb1b86b-1f65-11e3-8a27-00e04c395324",
					LineNumber: (i + 1).toString(),
					Цена: el.price,
					Сума: el.price * el.quantity,
					СтавкаНДС: "НеНДС",
					СуммаНДС: 0,
					СуммаСНДС: el.price * el.quantity,
					КодСтроки: "0",
					СуммаВзаиморасчето: el.price * el.quantity,
					НомерСтрокиДокументаПоставщика: "0",
					Сертификат: "",
					НомерПаспорта: "",
					СтатусУказанияСерий: 0,
					АналитикаРасходов_Type: "StandardODATA.Undefined",
				})),
			},
		});
		if (response.Number && response.Date) {
			navigate(`/document-helper/income/${response.Number}/${response.Date}`, {
				replace: true,
			});
		}
	}

	function nextStep() {}

	function prevStep() {}
	switch (step) {
		case 0: {
			return (
				<div>
					<DocumentInformation document={document} setDocument={setDocument} />
				</div>
			);
			break;
		}
	}
	return (
		<>
			<main className="px-3 py-8 bg-gray-100 h-full flex justify-center">
				<div className="w-full max-w-[1300px]">
					<div className="flex justify-between py-2">
						<button
							disabled={true}
							className="border p-2 rounded-lg bg-white disabled:bg-transparent"
						>
							<ChevronLeft />
						</button>
						<button>
							<ChevronRight />
						</button>
					</div>

					<Route path="/details">
						<DocumentInformation
							document={document}
							setDocument={setDocument}
						/>
					</Route>
					<Route path="/import">
						<ProductImport setDocumentProducts={setDocumentProducts} />
					</Route>
					<Route path="/price"></Route>
					<Route path="/final">
						<FinalStep />
					</Route>
					{/*<Show when={activeTab === "products"}>
					<div className="max-w-7xl mx-auto px-4">
						<div className="px-3 pt-4 pb-2">
							<label className="flex gap-2 select-none cursor-pointer">
								Обрати усі
							</label>
						</div>
						{document?.products?.map((el, i) => {
							return (
								<div
									key={"document_product_" + i}
									className="border shadow-sm my-2 py-1 px-1 flex items-center gap-2 rounded-md"
								>
									<input
										type="checkbox"
										className="ml-2"
										checked={el.selected}
									/>

									<span className="flex-1">{el.name}</span>
									<span>{el.quantity}</span>
									<button
										className="text-red-500 hover:bg-gray-200 p-2 rounded-md disabled:bg-gray-200 disabled:text-gray-700"
										disabled={!allowEditing}
									>
										<Trash size={20} />
									</button>
								</div>
							);
						})}
					</div>
				</Show>*/}
				</div>
			</main>
		</>
	);
}
