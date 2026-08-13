import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef } from "react";

interface ConfirmationDialogProps {
  jobTitle: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmationDialog({
  jobTitle,
  isPending,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onCancel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPending, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel();
      }}
    >
      <div
        aria-describedby="remove-job-description"
        aria-labelledby="remove-job-title"
        aria-modal="true"
        className="w-full rounded-xl border border-primary bg-background p-5 text-text shadow-xl"
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon className="mt-1 text-danger" icon={faTriangleExclamation} />
            <div>
              <h2 className="text-xl font-normal" id="remove-job-title">
                Remove job?
              </h2>
              <p className="mt-2 text-sm font-light opacity-75" id="remove-job-description">
                Remove {jobTitle} from your saved jobs? This cannot be undone here.
              </p>
            </div>
          </div>
          <button
            aria-label="Close confirmation"
            className="rounded-md p-1 transition hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            className="w-1/2 rounded-lg bg-primary px-4 py-3 transition hover:scale-[1.02] hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            onClick={onCancel}
            ref={cancelButton}
            type="button"
          >
            Cancel
          </button>
          <button
            className="w-1/2 rounded-lg bg-primary px-4 py-3 transition hover:scale-[1.02] hover:bg-danger hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-wait disabled:opacity-50"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
