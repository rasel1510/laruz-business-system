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

  // Touch support for mobile pinch-to-zoom and drag
  const onTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setStartY(e.touches[0].pageY - (containerRef.current?.offsetTop || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const onTouchEnd = () => setIsDragging(false);

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    const x = e.touches[0].pageX - (containerRef.current?.offsetLeft || 0);
    const y = e.touches[0].pageY - (containerRef.current?.offsetTop || 0);
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
        <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[1000px] bg-[#0b132b]/95 backdrop-blur-xl border-[#1a2340] text-white p-0 overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1a2340] shrink-0">
            <DialogTitle className="text-base sm:text-xl font-serif tracking-wide text-blue-400 truncate pr-8">{name}</DialogTitle>
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
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchMove}
            className={`relative w-full bg-[#050816] overflow-hidden flex items-center justify-center p-2 sm:p-4 flex-1 min-h-[200px] sm:min-h-[300px] aspect-auto sm:aspect-video ${
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
                sizes="(max-width: 640px) 100vw, (max-width: 1000px) 100vw, 1000px"
              />
            </div>
          </div>

          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[#1a2340]/30 border-t border-[#1a2340] flex justify-between items-center shrink-0 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="h-8 w-8 sm:h-9 sm:w-9 bg-white/5 border-[#1a2340] text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <div className="min-w-[50px] sm:min-w-[70px] text-center text-xs sm:text-sm font-medium text-slate-300 bg-[#1a2340] px-1.5 sm:px-2 py-1 rounded-md border border-[#2a3556]">
                {Math.round(scale * 100)}%
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 4}
                className="h-8 w-8 sm:h-9 sm:w-9 bg-white/5 border-[#1a2340] text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="h-8 w-8 sm:h-9 sm:w-9 ml-1 sm:ml-2 bg-white/5 border-[#1a2340] text-slate-400 hover:text-white hover:bg-white/10"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <span className="ml-2 sm:ml-4 text-xs text-slate-500 hidden md:inline">Tip: Use mouse wheel to zoom, drag to pan</span>
            </div>

            <Button
              onClick={() => setOpen(false)}
              className="px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20 text-xs sm:text-sm"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
