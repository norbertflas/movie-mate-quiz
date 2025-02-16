
import { Button } from '@/components/ui/button';
import { Share2, X, Facebook, Link } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface MovieSocialShareProps {
  title: string;
  description: string;
  url: string;
}

export const MovieSocialShare = ({ title, description, url }: MovieSocialShareProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: t('share.linkCopied'),
      description: t('share.linkCopiedDescription'),
    });
  };

  const shareOnX = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${title}\n${description}\n${url}`
    )}`;
    window.open(xUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <Button
        variant="outline"
        size="icon"
        className="w-full h-9"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="w-full h-9"
        onClick={shareOnX}
      >
        <X className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="w-full h-9"
        onClick={shareOnFacebook}
      >
        <Facebook className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="w-full h-9"
        onClick={handleCopyLink}
      >
        <Link className="w-4 h-4" />
      </Button>
    </div>
  );
};
