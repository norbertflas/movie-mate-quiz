interface MovieTrailerProps {
  trailerUrl: string;
  title: string;
}

export const MovieTrailer = ({ trailerUrl, title }: MovieTrailerProps) => {
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle YouTube URLs
    const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0`;
    }
    
    // Handle Vimeo URLs
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // If no match found, return the original URL
    return url;
  };

  const embedUrl = getEmbedUrl(trailerUrl);
  
  if (!embedUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No trailer available</p>
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      title={`${title} trailer`}
    />
  );
};