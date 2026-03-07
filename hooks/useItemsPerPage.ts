"use client";

import { useState, useEffect } from "react";

/** Desktop: 30 per page, Mobile: 16 per page */
export function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState(16);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setItemsPerPage(mq.matches ? 30 : 16);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return itemsPerPage;
}
