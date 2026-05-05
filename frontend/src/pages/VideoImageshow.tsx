
import VideoCard from "@/components/ui/VideoCard";
import video1 from "../assets/motarcar1.mp4";
import video2 from "../assets/motorcar2.mp4";

const VideoImageshow = () => {
  return (
    <div className="px-6 py-10 bg-gray-100">

      {/* Single video */}
      <div className="w-full">
        <VideoCard src={video1} />
      </div>

    </div>
  );
};

export default VideoImageshow;