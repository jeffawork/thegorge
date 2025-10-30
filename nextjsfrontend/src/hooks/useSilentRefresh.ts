// src/hooks/useSilentRefresh.ts
import axiosInst from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function useSilentRefresh() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await axiosInst.get("/auth/refresh");
        console.info("🔁 Session refreshed silently");
      } catch (err) {
        console.warn("Silent refresh failed:", err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  return ready;
}
