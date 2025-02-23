import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { useState } from "react";

const headers = [
  "Артикул",
  "НомерПроизводителя",
  "Наименование",
  "Цена",
  "ВНаличииОстаток",
  "МинЗапас",
];

export default function Reports() {
  const [selectedSupplier, setSelectedSupplier] = useState<
    string | undefined
  >();

  const { data: suppliers } = useSWR("/api/suppliers/", () =>
    fetcher<any[]>({
      url: "/shop/hs/api/suppliers",
      method: "GET",
    }),
  );

  const { data } = useSWR(
    "/reports/leftovers-by-supplier/" + selectedSupplier,
    () =>
      fetcher<any[]>({
        url: "/shop/hs/reports/leftovers-by-supplier/" + selectedSupplier,
        method: "GET",
      }),
    { revalidateOnMount: false },
  );
  return (
    <main className="flex items-center flex-col w-screen">
      <select onChange={(e) => setSelectedSupplier(e.target.value)}>
        {suppliers?.map((sp, i) => (
          <option key={sp["Код"]} value={sp["Код"]}>
            {sp["Наименование"]}
          </option>
        ))}
      </select>
      <span></span>
      {/*{data?.reduce((p, c) => p + c["ВНаличииОстаток"], 0)}*/}

      {/*{data?.reduce((p, c) => p + c["МинЗапас"], 0)}*/}
      <span className="text-xl">
        Недостатньо штучок:
        {data
          ?.filter((c) => c["ВНаличииОстаток"] - c["МинЗапас"] < 0)
          .reduce((p, c) => p + (c["ВНаличииОстаток"] - c["МинЗапас"]), 0)}
      </span>
      <span className="text-xl">
        Сума:
        {data
          ?.filter((c) => c["ВНаличииОстаток"] - c["МинЗапас"] < 0)
          .reduce(
            (p, c) =>
              p + Math.abs(c["ВНаличииОстаток"] - c["МинЗапас"]) * c["Цена"],
            0,
          )}
      </span>

      <table>
        <tr>
          {headers.map((k) => (
            <td className="border p-2">{k}</td>
          ))}
        </tr>

        {data
          ?.map((el) => ({
            ...el,
            Разница: el["ВНаличииОстаток"] - el["МинЗапас"],
          }))
          .sort((a, b) => a["Разница"] - b["Разница"])
          .map((el) => <Row headers={headers} el={el} />)}
      </table>
    </main>
  );
}

function Row({ headers, el }: { headers: string[]; el: Record<string, any> }) {
  const [selected, setSelected] = useState(false);
  return (
    <tr
      onClick={() => setSelected(!selected)}
      className={selected ? "bg-green-200" : ""}
    >
      {headers.map((k) => (
        <td className="border p-2">{el[k]}</td>
      ))}
      <td className="border p-2">{el["ВНаличииОстаток"] - el["МинЗапас"]}</td>
    </tr>
  );
}
