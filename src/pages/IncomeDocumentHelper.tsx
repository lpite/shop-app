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
import { PriceSetting } from "../components/income-document-helper/price-setting";
import { useIncomeDocumentHepler } from "../stores/income-document-helper-store";

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

export function IncomeDocumentHelper() {
	const [_, navigate] = useLocation();
	const { document } = useIncomeDocumentHepler();

	const [step, setStep] = useState(0);

	async function saveDocument() {
		if (!confirm("Зберегти")) {
			return;
		}

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
					Цена: el.retailPrice,
					Сума: el.retailPrice * el.quantity,
					СтавкаНДС: "НеНДС",
					СуммаНДС: 0,
					СуммаСНДС: el.retailPrice * el.quantity,
					КодСтроки: "0",
					СуммаВзаиморасчето: el.retailPrice * el.quantity,
					НомерСтрокиДокументаПоставщика: "0",
					Сертификат: "",
					НомерПаспорта: "",
					СтатусУказанияСерий: 0,
					АналитикаРасходов_Type: "StandardODATA.Undefined",
				})),
			},
		});
		if (response.Number && response.Date) {
			alert("Створено!");
		} else {
			alert("Не створено!");
		}
	}

	function nextStep() {
		setStep((p) => p + 1);
	}

	function prevStep() {
		setStep((p) => p - 1);
	}

	switch (step) {
		case 0: {
			const canProceed =
				document.supplierRef.length &&
				document.counterPartyRef.length &&
				document.warehouseRef.length;

			return (
				<div className="w-full max-w-[1300px] p-4 mx-auto">
					<div className="flex justify-between py-2">
						<button
							onClick={prevStep}
							disabled={step === 0}
							className="border p-2 rounded-lg bg-white disabled:opacity-25"
						>
							<ChevronLeft />
						</button>
						<button
							onClick={nextStep}
							disabled={!canProceed}
							className="border p-2 rounded-lg bg-white disabled:opacity-25"
						>
							<ChevronRight />
						</button>
					</div>
					<DocumentInformation />
				</div>
			);
		}
		case 1: {
			const canProceed = document.products.length;
			return (
				<div className="w-full h-full max-w-[1300px] p-4 mx-auto flex flex-col">
					<div className="flex justify-between py-2">
						<button
							onClick={prevStep}
							className="border p-2 rounded-lg bg-white disabled:bg-transparent"
						>
							<ChevronLeft />
						</button>
						<button
							onClick={nextStep}
							disabled={!canProceed}
							className="border p-2 rounded-lg bg-white disabled:opacity-25"
						>
							<ChevronRight />
						</button>
					</div>
					<ProductImport />
				</div>
			);
		}
		case 2: {
			return (
				<div className="w-full h-full max-w-[1300px] p-4 mx-auto flex flex-col">
					<div className="flex justify-between py-2">
						<button
							onClick={prevStep}
							className="border p-2 rounded-lg bg-white disabled:bg-transparent"
						>
							<ChevronLeft />
						</button>
						<button
							onClick={nextStep}
							className="border p-2 rounded-lg bg-white disabled:opacity-25"
						>
							<ChevronRight />
						</button>
					</div>
					<PriceSetting />
				</div>
			);
		}
		case 3: {
			return (
				<div className="w-full h-full max-w-[1300px] p-4 mx-auto flex flex-col">
					<div className="flex justify-between py-2">
						<button
							onClick={prevStep}
							className="border p-2 rounded-lg bg-white disabled:bg-transparent"
						>
							<ChevronLeft />
						</button>
						<button
							onClick={nextStep}
							disabled
							className="border p-2 rounded-lg bg-white disabled:opacity-25"
						>
							<ChevronRight />
						</button>
					</div>
					<FinalStep saveDocument={saveDocument} />
				</div>
			);
		}
	}
}
