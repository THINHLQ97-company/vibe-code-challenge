"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { Button } from "@/components/dsvh/ui/Button";
import { Progress } from "@/components/dsvh/ui/Progress";
import {
  FileIcon,
  CloseIcon,
  CheckIcon,
  ArrowUpIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
} from "@/components/dsvh/icons";

/* ============================================================================
   TYPES & INTERFACES
   ============================================================================ */

export type FileStatus = "queued" | "uploading" | "paused" | "done" | "error";

export type FileItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: FileStatus;
  error?: string;
  timeRemaining?: number;
};

export interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (files: FileItem[]) => void;
  maxFiles?: number;
  accept?: string;
}

/* ============================================================================
   HELPERS
   ============================================================================ */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    if (mb >= 0.1) return `${mb.toFixed(1)}MB`;
    return `${Math.round(bytes / 1024)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function validateFileExtension(filename: string, accept: string): boolean {
  if (!accept || accept === "*") return true;
  const ext = "." + filename.split(".").pop()?.toLowerCase();
  const allowed = accept
    .split(",")
    .map((item) => item.trim().toLowerCase());
  return allowed.some((allowedExt) => {
    if (allowedExt.startsWith(".")) {
      return ext === allowedExt || (allowedExt === ".jpg" && ext === ".jpeg");
    }
    return true;
  });
}

/* ============================================================================
   UPLOAD MODAL COMPONENT
   ============================================================================ */

export function UploadModal({
  open,
  onClose,
  onComplete,
  maxFiles = 5,
  accept = ".jpg,.png,.svg,.zip",
}: UploadModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock scroll on body and listen for Escape key
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Simulate file upload progress with setInterval
  useEffect(() => {
    const uploadingFiles = files.filter((f) => f.status === "uploading");
    if (uploadingFiles.length === 0) return;

    const interval = setInterval(() => {
      setFiles((prevFiles) =>
        prevFiles.map((item) => {
          if (item.status !== "uploading") return item;

          // Increment progress by realistic step (8-16%)
          const step = Math.floor(Math.random() * 9) + 8;
          const nextProgress = Math.min(100, item.progress + step);
          const isFinished = nextProgress >= 100;

          // Estimate seconds remaining based on ~12% per second
          const remainingPct = 100 - nextProgress;
          const secondsLeft = isFinished ? 0 : Math.max(1, Math.ceil(remainingPct / 12));

          return {
            ...item,
            progress: nextProgress,
            status: isFinished ? "done" : "uploading",
            timeRemaining: secondsLeft,
          };
        })
      );
    }, 450);

    return () => clearInterval(interval);
  }, [files]);

  // Process incoming files from input or dropzone
  const processFiles = useCallback(
    (newFileList: FileList | File[]) => {
      setErrorMessage(null);
      const incoming = Array.from(newFileList);

      if (incoming.length === 0) return;

      const currentCount = files.length;
      if (currentCount >= maxFiles) {
        setErrorMessage(`Upload limit reached! You can upload up to ${maxFiles} files max.`);
        return;
      }

      const availableSlots = maxFiles - currentCount;
      const validFiles: File[] = [];
      const invalidNames: string[] = [];

      for (const file of incoming) {
        if (validateFileExtension(file.name, accept)) {
          validFiles.push(file);
        } else {
          invalidNames.push(file.name);
        }
      }

      if (invalidNames.length > 0) {
        setErrorMessage(
          `Invalid file format: ${invalidNames.join(", ")}. Only ${accept} files supported.`
        );
      }

      if (validFiles.length > availableSlots) {
        setErrorMessage(
          `You can only add ${availableSlots} more file(s). Maximum is ${maxFiles} files max.`
        );
      }

      const filesToAdd = validFiles.slice(0, availableSlots);
      const newItems: FileItem[] = filesToAdd.map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "queued",
        timeRemaining: 8,
      }));

      if (newItems.length > 0) {
        setFiles((prev) => [...prev, ...newItems]);
      }
    },
    [files.length, maxFiles, accept]
  );

  // Drag and drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  // Actions on file items
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
    setErrorMessage(null);
  };

  const togglePause = (id: string) => {
    setFiles((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "uploading") {
          return { ...item, status: "paused" };
        }
        if (item.status === "paused") {
          return { ...item, status: "uploading" };
        }
        return item;
      })
    );
  };

  // Upload button handler
  const handleStartUpload = () => {
    const hasQueued = files.some((f) => f.status === "queued" || f.status === "paused");
    if (hasQueued) {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "queued" || f.status === "paused"
            ? { ...f, status: "uploading" }
            : f
        )
      );
    } else {
      if (onComplete) {
        onComplete(files);
      }
      onClose();
    }
  };

  if (!open) return null;

  const validFilesCount = files.length;
  const isAllDone = validFilesCount > 0 && files.every((f) => f.status === "done");
  const isUploading = files.some((f) => f.status === "uploading");
  const canUpload = validFilesCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box panel */}
      <div
        className="relative z-10 w-full max-w-[520px] rounded-2xl bg-surface p-6 shadow-xl border border-stroke flex flex-col gap-5 max-h-[calc(100vh-3rem)] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* 1) HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-title font-semibold text-ink leading-6">
              Media Upload
            </h2>
            <p className="mt-1 text-body text-ink-3">
              Add your documents here, and you can upload up to 5 files max
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-ink-3 hover:bg-stroke-soft hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30"
            aria-label="Close dialog"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* 2) DROPZONE */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`group border-2 border-dashed rounded-xl py-7 px-4 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-orange bg-orange/5"
              : "border-stroke bg-surface hover:border-ink-3 hover:bg-surface-2"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-11 h-11 rounded-full bg-stroke-soft flex items-center justify-center mx-auto mb-3 text-ink-2 group-hover:text-orange group-hover:bg-orange/10 transition-colors">
            <ArrowUpIcon size={20} />
          </div>

          <p className="text-body font-medium text-ink-2">
            Drag your file(s) to start uploading
          </p>

          <div className="my-2.5 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-stroke-soft" />
            <span className="text-caption font-semibold text-ink-3 uppercase">OR</span>
            <span className="h-px w-10 bg-stroke-soft" />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Browse files
          </Button>
        </div>

        {/* 3) HELPER TEXT & ERRORS */}
        <div className="-mt-2">
          <p className="text-caption text-ink-3">
            Only support .jpg, .png and .svg and zip files
          </p>
          {errorMessage && (
            <p className="mt-1.5 text-caption text-red font-medium flex items-center gap-1">
              <span>•</span> {errorMessage}
            </p>
          )}
        </div>

        {/* 4) FILE LIST */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto pr-1">
            {files.map((item) => {
              const isUploadingState = item.status === "uploading";
              const isPausedState = item.status === "paused";
              const isDoneState = item.status === "done";

              return (
                <div
                  key={item.id}
                  className="group relative flex items-center gap-3 rounded-xl border border-stroke bg-surface p-3 transition-colors hover:border-stroke-soft"
                >
                  {/* File type icon box */}
                  <div className="w-10 h-10 rounded-lg bg-stroke-soft text-ink-2 flex items-center justify-center shrink-0">
                    <FileIcon size={20} />
                  </div>

                  {/* File info and state */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-body font-medium text-ink truncate">
                        {item.name}
                      </p>
                      {!isUploadingState && !isPausedState && (
                        <span className="text-caption text-ink-3 shrink-0">
                          {formatFileSize(item.size)}
                        </span>
                      )}
                    </div>

                    {/* State: uploading or paused */}
                    {(isUploadingState || isPausedState) && (
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-caption text-ink-3 mb-1">
                          <span>
                            {isPausedState
                              ? `Paused • ${item.progress}%`
                              : `Uploading… ${item.progress}% • ${
                                  item.timeRemaining ?? 0
                                } seconds remaining`}
                          </span>
                        </div>
                        <Progress value={item.progress} tone="orange" size="sm" />
                      </div>
                    )}

                    {/* State: done label indicator */}
                    {isDoneState && (
                      <div className="mt-0.5 flex items-center gap-1 text-caption text-teal font-medium">
                        <CheckIcon size={13} />
                        <span>Upload completed</span>
                      </div>
                    )}

                    {/* State: error */}
                    {item.status === "error" && item.error && (
                      <p className="mt-0.5 text-caption text-red">{item.error}</p>
                    )}
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Done check mark */}
                    {isDoneState && (
                      <div className="w-6 h-6 rounded-full bg-teal/10 text-teal flex items-center justify-center">
                        <CheckIcon size={14} />
                      </div>
                    )}

                    {/* Uploading or Paused action controls */}
                    {(isUploadingState || isPausedState) && (
                      <>
                        <button
                          type="button"
                          onClick={() => togglePause(item.id)}
                          className="w-7 h-7 rounded-full bg-stroke-soft text-ink-2 hover:text-ink hover:bg-stroke flex items-center justify-center transition-colors focus-visible:outline-none"
                          title={isPausedState ? "Resume" : "Pause"}
                        >
                          {isPausedState ? (
                            <PlayIcon size={12} />
                          ) : (
                            <PauseIcon size={12} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="w-7 h-7 rounded-full bg-stroke-soft text-red hover:bg-red/10 flex items-center justify-center transition-colors focus-visible:outline-none"
                          title="Cancel upload"
                        >
                          <CloseIcon size={12} />
                        </button>
                      </>
                    )}

                    {/* Delete button for queued / done / error states */}
                    {!isUploadingState && !isPausedState && (
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="rounded-lg p-1.5 text-ink-3 hover:bg-stroke-soft hover:text-ink transition-colors focus-visible:outline-none"
                        aria-label="Remove file"
                        title="Remove file"
                      >
                        <TrashIcon size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5) FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="solid"
            disabled={!canUpload}
            onClick={handleStartUpload}
          >
            {isAllDone ? "Done" : isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   DEMO COMPONENT
   ============================================================================ */

export function UploadModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);

  return (
    <div className="p-6 rounded-2xl bg-surface border border-stroke flex flex-col items-start gap-4">
      <div>
        <h3 className="text-title font-semibold text-ink">Upload Modal Component</h3>
        <p className="text-caption text-ink-3 mt-1">
          Click the button below to test the full multi-state media upload flow.
        </p>
      </div>

      <Button variant="solid" onClick={() => setIsOpen(true)}>
        <ArrowUpIcon size={16} />
        Open Media Upload
      </Button>

      {uploadedFiles.length > 0 && (
        <div className="w-full mt-2 p-4 rounded-xl bg-surface-2 border border-stroke">
          <p className="text-caption font-semibold text-ink-2 uppercase tracking-wide mb-2">
            Uploaded Files ({uploadedFiles.length})
          </p>
          <ul className="space-y-1.5">
            {uploadedFiles.map((f) => (
              <li key={f.id} className="text-caption text-ink flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                <span className="font-medium truncate">{f.name}</span>
                <span className="text-ink-3">({formatFileSize(f.size)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <UploadModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={(files) => setUploadedFiles(files)}
        maxFiles={5}
        accept=".jpg,.png,.svg,.zip"
      />
    </div>
  );
}
