import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Car360ViewerProps {
  images: string[];
}

const Car360Viewer = ({ images: propImages }: Car360ViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [currentDegree, setCurrentDegree] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Use prop images
  const images = propImages;

  // Drag Start
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  // Drag Move (SMOOTH)
  const handleMove = (clientX: number) => {
    if (!isDragging || !images || images.length === 0) return;

    const deltaX = clientX - startX;
    const sensitivity = 5;

    if (Math.abs(deltaX) > sensitivity) {
      const direction = deltaX > 0 ? 1 : -1;

      setCurrentIndex((prev) => {
        return (prev + direction + images.length) % images.length;
      });

      setStartX(clientX);
    }
  };

  //  Drag End
  const handleEnd = () => {
    setIsDragging(false);
  };

  // Degree update
  useEffect(() => {
    if (images && images.length > 0) {
      setCurrentDegree((currentIndex / images.length) * 360);
    }
  }, [currentIndex, images]);

  // Auto Rotate
  useEffect(() => {
    if (!autoRotate || !images || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 500);

    return () => clearInterval(interval);
  }, [autoRotate, images]);

  return (
    <div className="w-full">
      {/* Viewer */}
      {images && images.length > 0 && (
        <div className="bg-white shadow rounded p-6">
          {/* Controls */}
          <div className="flex justify-between mb-4">
            <span className="text-blue-600 font-semibold">
              {Math.round(currentDegree)}°
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                {autoRotate ? "Stop" : "Auto Rotate"}
              </button>

              <button
                onClick={() => setCurrentIndex(0)}
                className="bg-gray-600 text-white px-3 py-1 rounded"
              >
                Reset
              </button>
            </div>
          </div>

          {/* 360 Image */}

           <div
            ref={viewerRef}
            className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-gray-100 flex items-center justify-center rounded overflow-hidden touch-none"
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={handleEnd}
          >

          {/* <div
            ref={viewerRef}
            className="h-[500px] bg-gray-100 flex items-center justify-center rounded overflow-hidden"
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={handleEnd}
          > */}
            <img
              src={images[currentIndex]}
              alt="360 view"
              className="w-full h-full object-cover "
              draggable={false}
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                    index === currentIndex
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty */}
      {(!images || images.length === 0) && (
        <div className="text-center text-gray-400 mt-10">
          No images available
        </div>
      )}
    </div>
  );
};

export default Car360Viewer;