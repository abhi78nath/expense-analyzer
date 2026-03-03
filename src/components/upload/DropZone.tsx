import { useRef, useState, useCallback } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropZoneProps {
    selectedFile: File | null;
    onFileSelect: (file: File | null) => void;
}

const DropZone = ({ selectedFile, onFileSelect }: DropZoneProps) => {
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

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === "application/pdf") {
                onFileSelect(files[0]);
            }
        },
        [onFileSelect]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div
            id="drop-zone"
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-8
        transition-all duration-300 ease-out
        ${isDragActive
                    ? "border-emerald-500 bg-emerald-500/5 shadow-[inset_0_0_30px_rgba(16,185,129,0.06)]"
                    : selectedFile
                        ? "border-emerald-500/40 bg-emerald-500/3"
                        : "border-slate-700 bg-transparent hover:border-slate-600 hover:bg-white/2"
                }
      `}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                onChange={handleInputChange}
                className="hidden"
                id="file-input"
            />

            {selectedFile ? (
                /* File selected state */
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10">
                        <FileText className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="max-w-[200px] truncate text-sm font-medium text-white">
                            {selectedFile.name}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            className="h-6 w-6 rounded-full bg-slate-700 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            aria-label="Remove file"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <span className="text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click to change file
                    </span>
                </div>
            ) : (
                /* Empty state */
                <div className="flex flex-col items-center gap-3">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${isDragActive ? "bg-emerald-500/15" : "bg-[#1e293b]"
                            }`}
                    >
                        <CloudUpload
                            className={`h-7 w-7 transition-colors duration-300 ${isDragActive ? "text-emerald-400" : "text-[#94a3b8]"
                                }`}
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">
                            Drop your PDF here
                        </p>
                        <p className="mt-1 text-xs text-[#94a3b8]">or click to browse</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropZone;
