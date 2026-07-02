"use client";

import { useState } from "react";
import { deleteBookingAction } from "@/app/admin/actions";
import { Trash2 } from "lucide-react";

interface DeleteBookingBtnProps {
  id: number;
}

export function DeleteBookingBtn({ id }: DeleteBookingBtnProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking reservation permanently?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteBookingAction(id);
      if (res?.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      aria-label="Delete booking"
      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 disabled:opacity-50 transition cursor-pointer"
    >
      <Trash2 className="w-4 h-4 stroke-[2]" />
    </button>
  );
}
