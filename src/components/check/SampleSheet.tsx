"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import { samples, type Sample } from "@/lib/fixtures/samples";
import { useLanguage, useT } from "@/lib/i18n";

type Props = {
  open: boolean;
  highlightId?: string;
  onClose: () => void;
  onPick: (sample: Sample) => void;
};

// A bottom sheet on phones, a centered card on larger screens. Uses the native <dialog> for focus trapping and Esc.
export default function SampleSheet({ open, highlightId, onClose, onPick }: Props) {
  const t = useT();
  const { lang } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="sample-sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85vh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-white p-0 text-gray-900 shadow-xl backdrop:bg-black/40 sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-2xl"
    >
      <div className="p-5">
        <h2 id="sample-sheet-title" className="text-xl font-bold text-gray-900">
          {t("check.sampleTitle")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{t("check.sampleIntro")}</p>
        <ul className="mt-4 space-y-2">
          {samples.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onPick(s)}
                className={`flex min-h-[52px] w-full items-center rounded-xl border-2 px-4 text-left text-base font-semibold text-gray-900 transition-colors hover:bg-accent-soft ${
                  s.id === highlightId ? "border-accent bg-accent-soft" : "border-gray-200"
                }`}
              >
                {s.label[lang]}
              </button>
            </li>
          ))}
        </ul>
        <Button variant="ghost" size="md" className="mt-4 w-full" onClick={onClose}>
          {t("check.close")}
        </Button>
      </div>
    </dialog>
  );
}
