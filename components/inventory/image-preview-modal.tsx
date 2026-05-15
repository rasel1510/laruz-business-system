"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { X, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewModalProps {
  image: string;
  name: string;
  children: React.ReactNode;
}

export function ImagePreviewModal({ image, name, children }: ImagePreviewModalProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // If user is scrolling, zoom instead
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 4));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setStartY(e.pageY - (containerRef.current?.offsetTop || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const y = e.pageY - (containerRef.current?.offsetTop || 0);
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walkX;
      containerRef.current.scrollTop = scrollTop - walkY;
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer group relative"
      >
        {children}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <Maximize2 className="h-4 w-4 text-white" />
        </div>
      </div>

      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) handleReset();
      }}>
        <DialogContent className="sm:max-w-[1000px] bg-[#0b132b]/95 backdrop-blur-xl border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
          <DialogHeader className="px-6 py-4 border-b border-[#1a2340]">
            <DialogTitle className="text-xl font-serif tracking-wide text-blue-400">{name}</DialogTitle>
            <DialogDescription className="sr-only">
              View and zoom into the product image for {name}.
            </DialogDescription>
          </DialogHeader>

          <div 
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className={`relative aspect-video w-full bg-[#050816] overflow-hidden flex items-center justify-center p-4 ${
              scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            }`}
          >
            <div 
              className="relative transition-transform duration-100 ease-out pointer-events-none"
              style={{ 
                transform: `scale(${scale})`,
                minWidth: "100%",
                minHeight: "100%"
              }}
            >
              <Image
                src={image}
                alt={name}
                fill
                className="object-contain drop-shadow-2xl select-none"
                priority
                sizes="(max-width: 1000px) 100vw, 1000px"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-[#1a2340]/30 border-t border-[#1a2340] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="h-9 w-9 bg-white/5 border-[#1a2340] text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="min-w-[70px] text-center text-sm font-medium text-slate-300 bg-[#1a2340] px-2 py-1 rounded-md border border-[#2a3556]">
                {Math.round(scale * 100)}%
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 4}
                className="h-9 w-9 bg-white/5 border-[#1a2340] text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="h-9 w-9 ml-2 bg-white/5 border-[#1a2340] text-slate-400 hover:text-white hover:bg-white/10"
                title="Reset Zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <span className="ml-4 text-xs text-slate-500 hidden sm:inline">Tip: Use mouse wheel to zoom, drag to pan</span>
            </div>

            <Button
              onClick={() => setOpen(false)}
              className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
