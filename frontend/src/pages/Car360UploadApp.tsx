import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RotateCcw,
} from "lucide-react";

import {
  useState,
  useRef,
  useEffect,
} from "react";

interface Car360ViewerProps {
  images: string[];
}

const Car360Viewer = ({
  images: propImages,
}: Car360ViewerProps) => {

  const [currentIndex, setCurrentIndex] =
    useState<number>(0);

  const [isDragging, setIsDragging] =
    useState<boolean>(false);

  const [startX, setStartX] =
    useState<number>(0);

  const [currentDegree, setCurrentDegree] =
    useState<number>(0);

  const [autoRotate, setAutoRotate] =
    useState<boolean>(false);

  const viewerRef =
    useRef<HTMLDivElement>(null);

  const images = propImages || [];

  // =======================================
  // DRAG START
  // =======================================
  const handleStart = (
    clientX: number
  ) => {

    setIsDragging(true);
    setStartX(clientX);
  };

  // =======================================
  // DRAG MOVE
  // =======================================
  const handleMove = (
    clientX: number
  ) => {

    if (
      !isDragging ||
      images.length === 0
    ) return;

    const deltaX =
      clientX - startX;

    const sensitivity = 5;

    if (
      Math.abs(deltaX) >
      sensitivity
    ) {

      const direction =
        deltaX > 0 ? 1 : -1;

      setCurrentIndex((prev) => {

        return (
          prev +
          direction +
          images.length
        ) % images.length;
      });

      setStartX(clientX);
    }
  };

  // =======================================
  // DRAG END
  // =======================================
  const handleEnd = () => {
    setIsDragging(false);
  };

  // =======================================
  // DEGREE UPDATE
  // =======================================
  useEffect(() => {

    if (images.length > 0) {

      setCurrentDegree(
        (currentIndex / images.length) *
        360
      );
    }

  }, [currentIndex, images]);

  // =======================================
  // AUTO ROTATE
  // =======================================
  useEffect(() => {

    if (
      !autoRotate ||
      images.length === 0
    ) return;

    const interval =
      setInterval(() => {

        setCurrentIndex(
          (prev) =>
            (prev + 1) %
            images.length
        );

      }, 400);

    return () =>
      clearInterval(interval);

  }, [autoRotate, images]);

  // =======================================
  // EMPTY STATE
  // =======================================
  if (
    !images ||
    images.length === 0
  ) {

    return (
      <div
        className="
          w-full
          rounded-3xl
          border
          bg-white
          p-10
          text-center
          text-gray-400
          shadow-sm
        "
      >
        No images available
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* =======================================
          MAIN CARD
      ======================================= */}
      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          border
          overflow-hidden
        "
      >

        {/* =======================================
            HEADER
        ======================================= */}
        <div
          className="
            flex
            items-center
            justify-between
            p-4
            border-b
            bg-gray-50
          "
        >

          {/* LEFT */}
          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                px-3 py-1
                rounded-full
                bg-blue-100
                text-blue-700
                text-sm
                font-semibold
              "
            >
              {Math.round(
                currentDegree
              )}°
            </div>

            <div
              className="
                text-sm
                text-gray-500
                font-medium
              "
            >
              360° Interactive View
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <button
              onClick={() =>
                setAutoRotate(
                  !autoRotate
                )
              }
              className={`
                flex items-center
                gap-2
                px-4 py-2
                rounded-xl
                text-sm
                font-medium
                transition
                ${
                  autoRotate
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                }
              `}
            >

              {autoRotate ? (
                <RotateCcw size={16} />
              ) : (
                <RotateCw size={16} />
              )}

              {autoRotate
                ? "Stop"
                : "Auto"}
            </button>

            <button
              onClick={() =>
                setCurrentIndex(0)
              }
              className="
                px-4 py-2
                rounded-xl
                bg-gray-800
                text-white
                text-sm
                font-medium
                hover:bg-black
                transition
              "
            >
              Reset
            </button>
          </div>
        </div>

        {/* =======================================
            VIEWER
        ======================================= */}
        <div
          ref={viewerRef}
          className="
            relative
            w-full
            aspect-[4/3]
            md:aspect-[16/9]
            bg-gradient-to-br
            from-gray-100
            to-gray-200
            overflow-hidden
            touch-none
            select-none
          "
          onMouseDown={(e) =>
            handleStart(
              e.clientX
            )
          }
          onMouseMove={(e) =>
            handleMove(
              e.clientX
            )
          }
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) =>
            handleStart(
              e.touches[0].clientX
            )
          }
          onTouchMove={(e) =>
            handleMove(
              e.touches[0].clientX
            )
          }
          onTouchEnd={handleEnd}
        >

          {/* IMAGE */}
          <img
            src={
              images[currentIndex]
            }
            alt="360 view"
            draggable={false}
            className="
              w-full
              h-full
              object-contain
              transition-all
              duration-150
              ease-linear
            "
            style={{
              cursor:
                isDragging
                  ? "grabbing"
                  : "grab",
            }}
          />

          {/* =======================================
              LEFT BUTTON
          ======================================= */}
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) =>
                  (
                    prev -
                    1 +
                    images.length
                  ) %
                  images.length
              )
            }
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              w-11 h-11
              rounded-full
              bg-black/40
              backdrop-blur-md
              flex items-center
              justify-center
              text-white
              hover:bg-black/60
              transition
            "
          >
            <ChevronLeft
              size={22}
            />
          </button>

          {/* =======================================
              RIGHT BUTTON
          ======================================= */}
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) =>
                  (
                    prev +
                    1
                  ) %
                  images.length
              )
            }
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              w-11 h-11
              rounded-full
              bg-black/40
              backdrop-blur-md
              flex items-center
              justify-center
              text-white
              hover:bg-black/60
              transition
            "
          >
            <ChevronRight
              size={22}
            />
          </button>

          {/* =======================================
              BOTTOM INFO
          ======================================= */}
          <div
            className="
              absolute
              bottom-4
              left-1/2
              -translate-x-1/2
              px-5 py-2
              rounded-full
              bg-black/40
              backdrop-blur-md
              text-white
              text-xs
              font-medium
            "
          >
            Drag to rotate •
            {" "}
            {currentIndex + 1}
            /
            {images.length}
          </div>
        </div>

        {/* =======================================
            THUMBNAILS
        ======================================= */}
        {images.length > 1 && (

          <div
            className="
              flex
              gap-3
              p-4
              overflow-x-auto
              bg-white
            "
          >

            {images.map(
              (
                img,
                index
              ) => (

                <img
                  key={index}
                  src={img}
                  onClick={() =>
                    setCurrentIndex(
                      index
                    )
                  }
                  className={`
                    w-20 h-20
                    object-cover
                    rounded-2xl
                    cursor-pointer
                    border-2
                    transition-all
                    duration-200
                    hover:scale-105
                    ${
                      index ===
                      currentIndex
                        ? `
                          border-blue-500
                          scale-105
                          shadow-lg
                        `
                        : `
                          border-gray-200
                          opacity-70
                          hover:opacity-100
                        `
                    }
                  `}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Car360Viewer;