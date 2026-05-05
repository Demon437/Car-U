const VideoCard = ({ src }) => {
  return (
    <video
      className="w-full h-[600px] object-cover rounded-xl"
      src={src}
      autoPlay
      loop
      muted
      playsInline
    />
  );
};

export default VideoCard;