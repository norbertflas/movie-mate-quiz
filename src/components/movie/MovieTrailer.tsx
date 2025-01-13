interface MovieTrailerProps {
  trailerUrl: string;
  title: string;
}

export const MovieTrailer = ({ trailerUrl, title }: MovieTrailerProps) => {
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : '';
  };

  return (
    <iframe
      src={getEmbedUrl(trailerUrl)}
      className="w-full h-full"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      title={`${title} trailer`}
    />
  );
};