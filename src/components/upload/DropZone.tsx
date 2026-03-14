import { useRef, useState, useCallback } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropZoneProps {
    selectedFiles: File[];
    onFilesSelect: (files: File[]) => void;
}

const DropZone = ({ selectedFiles, onFilesSelect }: DropZoneProps) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const processFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;

        const validFiles = Array.from(newFiles).filter(file => file.type === "application/pdf");

        if (validFiles.length > 0) {
            // Merge with existing files, avoiding duplicates by name and size
            const updatedFiles = [...selectedFiles];
            validFiles.forEach(vf => {
                if (!updatedFiles.find(f => f.name === vf.name && f.size === vf.size)) {
                    updatedFiles.push(vf);
                }
            });
            onFilesSelect(updatedFiles);
        }
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
            processFiles(e.dataTransfer.files);
        },
        [selectedFiles, onFilesSelect]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        if (inputRef.current) {
            inputRef.current.value = ""; // Reset to allow re-selection
        }
    };

    const handleRemoveFile = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        onFilesSelect(updatedFiles);
    };

    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);

    return (
        <div
            id="drop-zone"
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-6
        transition-all duration-300 ease-out
        ${isDragActive
                    ? "border-emerald-500 bg-emerald-500/5 shadow-[inset_0_0_30px_rgba(16,185,129,0.06)]"
                    : selectedFiles.length > 0
                        ? "border-emerald-500/40 bg-emerald-500/3"
                        : "border-slate-700 bg-transparent hover:border-slate-600 hover:bg-white/2"
                }
      `}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleInputChange}
                className="hidden"
                id="file-input"
            />

            {selectedFiles.length > 0 ? (
                /* Files selected state */
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                        <FileText className="h-6 w-6 text-emerald-500" />
                    </div>

                    <div className="w-full max-h-32 overflow-y-auto px-2 space-y-2 custom-scrollbar">
                        {selectedFiles.map((file, idx) => (
                            <div key={`${file.name}-${idx}`} className="flex items-center justify-between gap-3 bg-slate-800/40 p-2 rounded-lg group">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-3.5 w-3.5 text-emerald-500/70" />
                                    <span className="truncate text-[11px] font-medium text-slate-200">
                                        {file.name}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleRemoveFile(idx, e)}
                                    className="h-5 w-5 rounded-full bg-slate-700/50 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                                    aria-label="Remove file"
                                >
                                    <X className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <span className="text-xs font-medium text-emerald-400/90">
                            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected • {(totalSize / 1024).toFixed(1)} KB
                        </span>
                        <p className="mt-1 text-[10px] text-slate-500 italic">Click or drag more to add</p>
                    </div>
                </div>
            ) : (
                /* Empty state */
                <div className="flex flex-col items-center gap-3 py-4">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${isDragActive ? "bg-emerald-500/15" : "bg-[#1e293b]"
                            }`}
                    >
                        <CloudUpload
                            className={`h-7 w-7 transition-colors duration-300 ${isDragActive ? "text-emerald-400" : "text-slate-400"
                                }`}
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">
                            Drop your PDFs here
                        </p>
                        <p className="mt-1 text-xs text-slate-400">or click to browse</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropZone;
