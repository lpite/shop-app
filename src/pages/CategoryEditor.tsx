import useSWR from "swr";
import { fetcher } from "../utils/fetcher";
import { useState } from "react";

export default function CategoryEditor() {
  const { data: categories } = useSWR("/api/category", () =>
    fetcher<any[]>({ url: "/shop/hs/api/category", method: "GET" }),
  );
  const [values, setValues] = useState({ name: "", parentId: "" });

  async function submit() {
    console.log(values);
    await fetcher({
      url: "/shop/hs/api/category/00-00000000",
      method: "POST",
      body: {
        name: values.name,
        parentId: values.parentId,
      },
    });
  }
  return (
    <main className="flex flex-col gap-3 w-full h-full items-center justify-center">
      <h1 className="text-2xl">Нова категорія</h1>
      <label className="border-2 h-8 flex gap-2 items-center">
        Назва
        <input
          className="p-0 outline-none"
          onChange={(e) => setValues({ ...values, name: e.target.value })}
        />
      </label>
      <label className="border-2 h-8 flex gap-2 items-center">
        є підкатегорією для
        <select
          className="py-4 px-6 text-xl"
          onChange={(e) => setValues({ ...values, parentId: e.target.value })}
        >
          <option defaultChecked>--</option>
          {categories?.map((c) => (
            <option value={c.id}>
              {c.parent.name} - {c.name}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={submit}
        className="bg-green-400 hover:bg-green-500 px-4 py-2 rounded-lg"
      >
        Створити
      </button>
    </main>
  );
}
