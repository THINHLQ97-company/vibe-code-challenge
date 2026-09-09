"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type DragEvent,
  type ChangeEvent,
} from "react";
import {
  FileIcon,
  CloseIcon,
  CheckIcon,
  UploadSimpleIcon,
  RefreshIcon,
} from "@/components/dsvh/icons";

/* ============================================================================
   TYPES & INTERFACES
   ============================================================================ */

export type FileStatus = "queued" | "uploading" | "success" | "error";

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number; // 0 - 100
  status: FileStatus;
  errorMessage?: string;
}

export interface RejectedFile {
  id: string;
  name: string;
  size: number;
  reason: string;
}

export interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxSize?: number;
  className?: string;
}

export interface FileRowProps {
  item: FileItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  disabled?: boolean;
}

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes (e.g. 5 * 1024 * 1024 = 5MB)
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  autoUpload?: boolean;
  value?: FileItem[];
  onChange?: (files: FileItem[]) => void;
  onUploadComplete?: (files: FileItem[]) => void;
  simulateErrorPattern?: string; // e.g. "fail" or "error" in filename triggers error
  className?: string;
  label?: string;
  description?: string;
}

/* ============================================================================
   HELPERS
   ============================================================================ */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function validateFile(
  file: File,
  accept?: string,
  maxSize?: number
): { valid: boolean; reason?: string } {
  // Check maximum file size
  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      reason: `Kích thước file (${formatFileSize(file.size)}) vượt quá giới hạn tối đa ${formatFileSize(maxSize)}.`,
    };
  }

  // Check accept pattern if provided
  if (accept && accept.trim() !== "") {
    const rules = accept
      .split(",")
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean);

    const fileName = file.name.toLowerCase();
    const fileType = (file.type || "").toLowerCase();

    const matches = rules.some((rule) => {
      if (rule.startsWith(".")) {
        // Extension matching (e.g., .pdf, .png)
        return fileName.endsWith(rule);
      }
      if (rule.endsWith("/*")) {
        // Wildcard MIME matching (e.g., image/*, video/*)
        const category = rule.slice(0, -2);
        return fileType.startsWith(`${category}/`);
      }
      // Exact MIME matching (e.g., application/pdf)
      return fileType === rule;
    });

    if (!matches) {
      return {
        valid: false,
        reason: `Định dạng file không phù hợp. Chỉ chấp nhận các dạng: ${accept}`,
      };
    }
  }

  return { valid: true };
}

/* ============================================================================
   SUB-COMPONENT 1: DROPZONE
   ============================================================================ */

export function Dropzone({
  onFilesSelected,
  accept,
  multiple = true,
  disabled = false,
  maxSize,
  className = "",
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only stop dragging if leaving the outer container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
      // Reset input value so re-selecting the same file triggers onChange
      e.target.value = "";
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all duration-200 text-center select-none ${
        disabled
          ? "opacity-50 cursor-not-allowed border-stroke bg-surface-2"
          : isDragging
          ? "border-orange bg-surface-2 shadow-xs cursor-copy"
          : "border-stroke bg-surface hover:bg-stroke-soft cursor-pointer"
      } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-stroke bg-surface-2 text-orange shadow-xs transition-transform duration-200 group-hover:scale-105">
        <UploadSimpleIcon size={24} className="text-orange" />
      </div>

      <div className="space-y-1">
        <p className="text-body font-semibold text-ink">
          Kéo thả file vào đây hoặc{" "}
          <span className="text-orange underline decoration-orange/40 underline-offset-4 font-medium">
            chọn file từ thiết bị
          </span>
        </p>
        <p className="text-caption text-ink-3">
          {accept ? `Hỗ trợ: ${accept}` : "Hỗ trợ mọi định dạng file"}
          {maxSize ? ` • Tối đa ${formatFileSize(maxSize)}` : ""}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
   SUB-COMPONENT 2: FILE ROW
   ============================================================================ */

export function FileRow({
  item,
  onRemove,
  onRetry,
  disabled = false,
}: FileRowProps) {
  const { name, size, progress, status, errorMessage } = item;

  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-stroke bg-surface transition-all duration-200 hover:bg-stroke-soft">
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: File Icon + Details */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center justify-center size-10 rounded-lg bg-surface-2 border border-stroke shrink-0 text-orange">
            <FileIcon size={20} className="text-orange" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <p
              className="text-body font-medium text-ink truncate"
              title={name}
            >
              {name}
            </p>
            <div className="flex items-center gap-2 text-caption text-ink-3">
              <span>{formatFileSize(size)}</span>

              {status === "queued" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-2 text-ink-3 border border-stroke text-meta font-medium">
                  Chờ tải
                </span>
              )}

              {status === "uploading" && (
                <span className="text-orange font-medium text-meta">
                  Đang tải... {progress}%
                </span>
              )}

              {status === "success" && (
                <span className="inline-flex items-center gap-1 text-teal font-medium text-meta">
                  <CheckIcon size={13} className="text-teal" /> Đã xong
                </span>
              )}

              {status === "error" && (
                <span className="text-orange font-medium text-meta">
                  Lỗi tải lên
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {status === "error" && (
            <button
              type="button"
              onClick={() => onRetry(item.id)}
              disabled={disabled}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stroke bg-surface text-caption font-semibold text-orange hover:bg-stroke-soft transition-colors disabled:opacity-50"
              title="Thử tải lại"
            >
              <RefreshIcon size={14} className="text-orange" />
              <span>Thử lại</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            className="p-1.5 rounded-lg text-ink-3 hover:text-orange hover:bg-stroke-soft transition-colors disabled:opacity-50"
            title="Xóa file này"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {status === "uploading" && (
        <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden border border-stroke/60 mt-1">
          <div
            className="bg-orange h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error detail banner */}
      {status === "error" && errorMessage && (
        <div className="flex items-center justify-between text-caption text-orange bg-surface-2 px-3 py-1.5 rounded-lg border border-stroke font-medium mt-1">
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   MAIN COMPONENT: FILE UPLOAD
   ============================================================================ */

export function FileUpload({
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  disabled = false,
  autoUpload = true,
  value,
  onChange,
  onUploadComplete,
  simulateErrorPattern,
  className = "",
  label = "Tải lên tài liệu",
  description = "Chọn hoặc kéo thả các tệp dữ liệu vào khu vực bên dưới",
}: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<FileItem[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);

  // Allow controlled component behavior if `value` prop is supplied
  const files = value !== undefined ? value : internalFiles;

  const updateFiles = useCallback(
    (updater: (prev: FileItem[]) => FileItem[]) => {
      if (value !== undefined) {
        onChange?.(updater(value));
      } else {
        setInternalFiles((prev) => {
          const next = updater(prev);
          onChange?.(next);
          return next;
        });
      }
    },
    [value, onChange]
  );

  // Simulated background upload progress engine using setInterval
  useEffect(() => {
    if (!autoUpload) return;

    const uploadingItems = files.filter((f) => f.status === "uploading");
    if (uploadingItems.length === 0) return;

    const interval = setInterval(() => {
      updateFiles((prevList) => {
        let hasChanges = false;
        const nextList = prevList.map((item) => {
          if (item.status !== "uploading") return item;

          hasChanges = true;
          // Simulated upload failure condition
          if (
            simulateErrorPattern &&
            item.name.toLowerCase().includes(simulateErrorPattern.toLowerCase()) &&
            item.progress >= 50
          ) {
            return {
              ...item,
              status: "error" as FileStatus,
              errorMessage: "Lỗi kết nối máy chủ khi tải tệp.",
            };
          }

          const nextProgress = Math.min(100, item.progress + Math.floor(Math.random() * 15) + 10);
          const isDone = nextProgress >= 100;

          return {
            ...item,
            progress: nextProgress,
            status: isDone ? ("success" as FileStatus) : ("uploading" as FileStatus),
          };
        });

        if (hasChanges) {
          const allCompleted = nextList.every(
            (f) => f.status === "success" || f.status === "error"
          );
          if (allCompleted) {
            onUploadComplete?.(nextList);
          }
        }

        return nextList;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [files, autoUpload, simulateErrorPattern, updateFiles, onUploadComplete]);

  // Handle incoming selected files from Dropzone
  const handleFilesSelected = (newRawFiles: File[]) => {
    const newlyRejected: RejectedFile[] = [];
    const validFileItems: FileItem[] = [];

    for (const rawFile of newRawFiles) {
      const validation = validateFile(rawFile, accept, maxSize);
      if (!validation.valid) {
        newlyRejected.push({
          id: Math.random().toString(36).slice(2, 9),
          name: rawFile.name,
          size: rawFile.size,
          reason: validation.reason || "Tệp không hợp lệ.",
        });
      } else {
        validFileItems.push({
          id: Math.random().toString(36).slice(2, 9),
          file: rawFile,
          name: rawFile.name,
          size: rawFile.size,
          type: rawFile.type,
          progress: 0,
          status: autoUpload ? "uploading" : "queued",
        });
      }
    }

    if (newlyRejected.length > 0) {
      setRejectedFiles((prev) => [...prev, ...newlyRejected]);
    }

    if (validFileItems.length > 0) {
      updateFiles((prev) => {
        if (!multiple) {
          return validFileItems.slice(0, 1);
        }
        const combined = [...prev, ...validFileItems];
        if (maxFiles && combined.length > maxFiles) {
          return combined.slice(0, maxFiles);
        }
        return combined;
      });
    }
  };

  const handleRemoveFile = (id: string) => {
    updateFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRetryFile = (id: string) => {
    updateFiles((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              progress: 0,
              status: "uploading",
              errorMessage: undefined,
            }
          : item
      )
    );
  };

  const handleRemoveRejected = (id: string) => {
    setRejectedFiles((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    updateFiles(() => []);
    setRejectedFiles([]);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Component Header */}
      {(label || description) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {label && (
              <h3 className="text-body font-semibold text-ink">{label}</h3>
            )}
            {description && (
              <p className="mt-1 text-caption leading-relaxed text-ink-3">
                {description}
              </p>
            )}
          </div>

          {files.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={disabled}
              className="shrink-0 whitespace-nowrap rounded-lg px-2 py-1 text-caption font-semibold text-orange transition-colors hover:bg-orange/10 disabled:opacity-50"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      )}

      {/* Main Dropzone */}
      <Dropzone
        onFilesSelected={handleFilesSelected}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        maxSize={maxSize}
      />

      {/* Rejected Files Warnings */}
      {rejectedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {rejectedFiles.map((rejected) => (
            <div
              key={rejected.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stroke bg-surface-2 text-caption text-orange"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{rejected.name}</p>
                <p className="text-ink-2 text-meta mt-0.5">
                  {rejected.reason}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRejected(rejected.id)}
                className="p-1 rounded-lg text-ink-3 hover:text-orange hover:bg-stroke-soft transition-colors"
                title="Bỏ qua"
              >
                <CloseIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State (When no valid files selected) */}
      {files.length === 0 && rejectedFiles.length === 0 && (
        <div className="flex items-center justify-center p-4 rounded-xl border border-stroke bg-surface-2 text-caption text-ink-3 text-center">
          Chưa có tệp nào được tải lên.
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-caption text-ink-2 font-medium px-1">
            <span>
              Danh sách tệp ({files.length}
              {maxFiles ? `/${maxFiles}` : ""})
            </span>
            <span>
              {successCount}/{files.length} hoàn thành • {formatFileSize(totalSize)}
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {files.map((item) => (
              <FileRow
                key={item.id}
                item={item}
                onRemove={handleRemoveFile}
                onRetry={handleRetryFile}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   DEMO USAGE EXAMPLE COMPONENT
   ============================================================================ */

export function FileUploadDemo() {
  const [demoFiles, setDemoFiles] = useState<FileItem[]>([]);

  return (
    <div className="not-prose mx-auto max-w-xl rounded-2xl border border-stroke bg-surface p-5 sm:p-6">
      <FileUpload
        accept="image/*,.pdf,.doc,.docx"
        maxSize={5 * 1024 * 1024} // 5 MB
        multiple={true}
        maxFiles={5}
        value={demoFiles}
        onChange={setDemoFiles}
        simulateErrorPattern="error"
        label="Tải lên tài liệu đính kèm"
        description="Chấp nhận ảnh, PDF, tài liệu Word tối đa 5MB per tệp. Nhập tệp có tên chứa 'error' để thử trạng thái lỗi."
      />
    </div>
  );
}

export default FileUpload;
