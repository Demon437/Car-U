import React from "react";
import { Play, Video, X } from "lucide-react";

interface ShowVideoProps {
  videos: string[];
  onClose?: () => void;
  showInModal?: boolean;
}

const ShowVideo: React.FC<ShowVideoProps> = ({ 
  videos, 
  onClose, 
  showInModal = false 
}) => {
  if (!videos || videos.length === 0) {
    return null;
  }

  const VideoCard = ({ video, index }: { video: string; index: number }) => (
    <div className="relative group bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Video Thumbnail with Play Button */}
      <div className="aspect-video relative bg-gray-800">
        <video
          src={video}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          onMouseEnter={(e) => {
            const videoElement = e.currentTarget;
            videoElement.play().catch(() => {});
          }}
          onMouseLeave={(e) => {
            const videoElement = e.currentTarget;
            videoElement.pause();
            videoElement.currentTime = 0;
          }}
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white fill-white" />
        </div>
        
        {/* Video Number Badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
          Video {index + 1}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-3 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-300">
            <Video className="w-4 h-4" />
            <span className="text-sm">Car Video {index + 1}</span>
          </div>
          <button
            onClick={() => {
              // Open video in new tab or modal
              window.open(video, '_blank');
            }}
            className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
          >
            View Full
          </button>
        </div>
      </div>
    </div>
  );

  if (showInModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500" />
              Car Videos ({videos.length})
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Videos Grid */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video, index) => (
                <VideoCard key={index} video={video} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular grid display
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Car Videos
          </h3>
        </div>
        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg text-xs font-medium">
          {videos.length} Videos
        </span>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <VideoCard key={index} video={video} index={index} />
        ))}
      </div>

      {/* View All Button for small screens */}
      {videos.length > 2 && (
        <div className="md:hidden text-center pt-4">
          <button
            onClick={() => {
              // Open modal view on mobile
              if (onClose) {
                // This would typically open a modal
                console.log('Open video modal');
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View All Videos
          </button>
        </div>
      )}
    </div>
  );
};

export default ShowVideo;