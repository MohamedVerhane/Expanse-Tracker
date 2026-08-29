"use client";

import { useEffect } from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/components/locale-provider";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslations();
  const resolvedTitle = title ?? t("confirm.title");
  const resolvedDescription = description ?? t("confirm.description");
  const resolvedConfirm = confirmLabel ?? t("action.delete");
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className={cn("w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg")}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <h2 className="text-lg font-semibold">{resolvedTitle}</h2>
            <p className="mt-2 text-sm text-muted">{resolvedDescription}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={onCancel}>
                {t("action.cancel")}
              </Button>
              <Button variant="danger" onClick={onConfirm}>
                {resolvedConfirm}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
