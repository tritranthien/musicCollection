import { useFetcher } from "react-router";
import { useCallback, useMemo, useState } from "react";

export default function useUpdateFile() {
  const fetcher = useFetcher();
  const [error, setError] = useState(null);

  const updateFile = useCallback(
    async (data, url = "/updateFile") => {
      if (!data || typeof data !== "object" || !data.id) {
        setError("Thiếu dữ liệu hoặc ID file để cập nhật");
        return;
      }

      try {
        setError(null);
        fetcher.submit(JSON.stringify(data), {
          method: "post",
          action: url,
          encType: "application/json",
        });
      } catch (err) {
        console.error("Update failed:", err);
        setError(err.message);
      }
    },
    [fetcher]
  );

  const state = useMemo(
    () => ({
      loading: fetcher.state === "submitting" || fetcher.state === "loading",
      data: fetcher.data,
      error: error || fetcher.data?.error || null,
    }),
    [fetcher.state, fetcher.data, error]
  );

  return { updateFile, ...state };
}
