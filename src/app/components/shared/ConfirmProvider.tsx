"use client";
import { createContext, useContext, useState } from "react";

type ConfirmOptions = {
  message: string;
  onConfirm: () => void;
};

const ConfirmContext = createContext<(options: ConfirmOptions) => void>(() => {});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({
  children,
  confirmName = "Xác nhận",
  cancelName = "Hủy",
}: {
  children: React.ReactNode;
  confirmName?: string;
  cancelName?: string;
}) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
  };

  const handleConfirm = () => {
    options?.onConfirm();
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-neutral-800 w-full max-w-sm rounded-xl p-6 shadow-lg animate-fadeIn">
            <p className="text-base text-gray-800 dark:text-white mb-6">
              {options.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOptions(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-neutral-700"
              >
                {cancelName}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                {confirmName}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
