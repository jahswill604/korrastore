// components/admin/orders/admin-orders-pagination.tsx — URL-driven pagination wrapper for Admin Orders.
// Handles page transition updates using Next.js router.
// Used in: app/admin/orders/page.tsx

"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

interface AdminOrdersPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function AdminOrdersPagination({
  currentPage,
  totalPages,
}: AdminOrdersPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      className="w-full max-w-md mx-auto"
    />
  );
}
