
import { Button } from '@/components/ui/button';
import { Instagram, X, Facebook, Link } from 'lucide-react';
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

  const shareOnInstagram = () => {
    // Since Instagram doesn't have a direct share URL, we'll copy the info to clipboard
    const shareText = `${title}\n${description}\n${url}`;
    navigator.clipboard.writeText(shareText);
    toast({
      title: t('share.linkCopied'),
      description: t('share.shareToInstagram'),
    });
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
        onClick={shareOnInstagram}
      >
        <Instagram className="w-4 h-4" />
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
