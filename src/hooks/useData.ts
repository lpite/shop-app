import React from "react";
import { FetchInputs } from "../utils/fetcher";

type UseDate = {
  url: string;
  method: "GET";
  query?: Record<string, string | number>;
  body?: Record<string, string | number | any[]>;
};

export default function useData<TParams extends FetchInputs>({
  url,
  method,
  query,
  body,
}: UseDate) {
  const [data, setData] = React.useState<FetchInputs>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [ip] = React.useState(localStorage.getItem("ip") || "localhost");

  React.useEffect(() => {
    setIsLoading(true);

    fetch(`http://${ip}/1c_connector/index.php`, {
      method: "POST",
      body: JSON.stringify({
        url: url,
        method: method,
        query: query,
        body: body,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      setIsLoading(false);
    };
  }, []);

  return { data, isLoading } as {
    data: any;
    isLoading: boolean;
  };
}
