import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../utils/fetcher";
import { Product } from "../../types/product";
import { useAppStore } from "../../stores/useAppStore";

export default function CatalogPopup() {
  const [page, setPage] = useState<"main" | "hex" | "spline" | "torx">("main");
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center justify-center h-10 border-2 px-3 gap-3 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
          </svg>
          Каталог
        </button>
      </Dialog.Trigger>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
      <Dialog.Content className="fixed min-w-3/6 min-h-80 w-3/6 bg-white shadow-lg top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pb-4 px-4 rounded-lg">
        <Dialog.Title className="text-2xl pb-3 font-medium">
          Каталог біт
        </Dialog.Title>
        <Dialog.Close asChild>
          <button className="absolute right-5 top-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </button>
        </Dialog.Close>
        {page === "main" && (
          <MainPage setPage={setPage} setIsOpen={setIsOpen} />
        )}
        {page !== "main" && <Products setPage={setPage} page={page} />}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function MainPage({
  setIsOpen,
}: {
  setPage: React.Dispatch<
    React.SetStateAction<"main" | "hex" | "spline" | "torx">
  >;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      {[
        {
          name: "hex 6-гран (біта)",
          img: "hex.png",
          searchValue: "біта hex",
        },
        {
          name: "spline 12-гран зірка (біта)",
          img: "spline.png",
          searchValue: "біта spline",
        },
        {
          name: "torx 6-гран зірка (біта)",
          img: "torx.png",
          searchValue: "біта torx",
        },
      ].map(({ name, img, searchValue }) => (
        <button
          onClick={() => {
            useAppStore.setState({ searchValue });
            setIsOpen(false);
          }}
          key={name}
          className="flex items-center gap-2 border-2 w-full p-2 my-1 rounded-xl hover:bg-black hover:bg-opacity-15"
        >
          <img className="h-20" src={`/icons/${img}`} />
          <span className="text-xl">{name}</span>
        </button>
      ))}
    </>
  );
}

function Products({
  page,
  setPage,
}: {
  page: "main" | "hex" | "spline" | "torx";
  setPage: React.Dispatch<
    React.SetStateAction<"main" | "hex" | "spline" | "torx">
  >;
}) {
  const { data: products } = useSWR(
    "/products/",
    () =>
      fetcher<Product[]>({
        url: "/shop/hs/app/product/",
        method: "GET",
      }),
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );
  return (
    <>
      <button
        onClick={() => setPage("main")}
        className="flex items-center px-4 py-2 gap-2 border-2 rounded-lg mb-5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
          />
        </svg>
        Назад
      </button>
      {products
        ?.filter((el) => {
          const n = el.name.toLowerCase();
          return n.includes("біта") && n.includes(page);
        })
        //@ts-expect-error треба для сортування мяу мяу
        .sort((a, b) => a.name > b.name)
        .map((p) => (
          <div className="border-b-2 py-1.5 gap-4 flex">
            <span className="w-8">{p.searchCode}</span>
            <span>{p.name}</span>
          </div>
        ))}
    </>
  );
}
