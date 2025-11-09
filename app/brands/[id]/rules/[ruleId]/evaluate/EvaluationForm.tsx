"use client";

import { useRef } from "react";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { BackgroundGradient } from "@/app/components/ui/BackgroundGradient";

type Props = {
  file: File | null;
  context: string;
  error: string | null;
  successMsg: string | null;
  isDragging: boolean;
  submitting: boolean;
  previewUrl: string | null;
  isImage: boolean;
  isVideo: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: React.DragEventHandler<HTMLLabelElement>;
  onDragOver: React.DragEventHandler<HTMLLabelElement>;
  onDragLeave: React.DragEventHandler<HTMLLabelElement>;
  onContextChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
};

export default function EvaluationForm({
  file,
  context,
  error,
  successMsg,
  isDragging,
  submitting,
  previewUrl,
  isImage,
  isVideo,
  onFileChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onContextChange,
  onSubmit,
  onClear,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Upload / Preview */}
      <BackgroundGradient>
        <Card className="bg-neutral-900 border-neutral-800">
          <div className="flex flex-col gap-5">
            <div>
              <label
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`flex flex-col items-center justify-center gap-3 w-full rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-700 hover:border-neutral-600 bg-neutral-950/40'} min-h-[14rem] md:min-h-[16rem]`}
                tabIndex={0}
                role="button"
              >
                <div className="text-neutral-300">
                  <svg className="w-10 h-10 mx-auto mb-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="font-medium">Drag your file here</div>
                  <div className="text-xs text-neutral-500 mt-1">or click to select</div>
                  <div className="text-xs text-neutral-500 mt-2">Video: max 5 MB • Image: max 10 MB</div>
                  {file && (
                    <div className="mt-3 text-xs text-neutral-400 break-all">
                      Selected: {file.name}
                    </div>
                  )}
                </div>
              </label>
              <input
                ref={fileInputRef}
                id="asset-input"
                type="file"
                accept="image/*,video/*"
                onChange={onFileChange}
                className="sr-only"
              />
            </div>

            {previewUrl && (
              <div className="rounded-lg border border-neutral-800 p-4 bg-neutral-950/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-neutral-300">Preview</div>
                  <div className="text-xs text-neutral-500">
                    {file?.type?.split("/")[0].toUpperCase()} • {file?.name}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  {isImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-80 object-contain rounded-md"
                    />
                  )}
                  {isVideo && (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full max-h-96 rounded-md"
                    />
                  )}
                </div>
                <div className="mt-3 text-xs text-neutral-500 break-all">
                  {(file?.size ?? 0) / 1024 < 1024
                    ? `${Math.round((file?.size ?? 0) / 1024)} KB`
                    : `${((file?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB`}
                </div>
              </div>
            )}
          </div>
        </Card>
      </BackgroundGradient>

      {/* Context + Submit */}
      <BackgroundGradient>
        <Card className="bg-neutral-900 border-neutral-800 h-full">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Evaluation Context
              </label>
              <textarea
                value={context}
                onChange={(e) => onContextChange(e.target.value)}
                placeholder="E.g.: TikTok Halloween advertisement, audience 18-25, playful tone."
                className="w-full rounded-md bg-neutral-950/60 border border-neutral-800 text-neutral-200 placeholder-neutral-600 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={8}
              />
              <p className="mt-2 text-xs text-neutral-500">
                Optional, helps provide context to the evaluator.
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-red-800/60 bg-red-950/40 text-red-300 text-sm p-3">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-md border border-green-800/60 bg-green-950/30 text-green-300 text-sm p-3">
                {successMsg}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={!file || submitting}
                className={!file || submitting ? "opacity-60 cursor-not-allowed" : ""}
              >
                {submitting ? "Submitting..." : "Evaluate"}
              </Button>
              <button
                type="button"
                onClick={onClear}
                className="px-4 py-2 rounded-md text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </Card>
      </BackgroundGradient>
    </div>
  );
}
