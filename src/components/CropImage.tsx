import React, { useState, useEffect } from 'react';
import { CropGuide } from '../types';
import { Sprout } from 'lucide-react';

interface CropImageProps {
  crop: CropGuide;
  className?: string;
  frameClassName?: string;
}

const CROP_SEARCH_TERMS: Record<string, string> = {
  wheat: 'wheat field ears grain',
  rice: 'rice paddy field plant',
  cotton: 'cotton plant boll field',
  sugarcane: 'sugarcane plantation stalks',
  maize: 'maize corn cob field',
  potato: 'potato tubers harvest',
  onion: 'onion bulbs harvest',
  tomato: 'tomato plant fruit',
  mustard: 'mustard flowers field yellow',
  chickpea: 'chickpea plant pods',
  mango: 'mango fruit tree',
  citrus: 'citrus orange tree fruit'
};

const CROP_EMOJIS: Record<string, string> = {
  wheat: '🌾',
  rice: '🌾',
  cotton: '🌱',
  sugarcane: '🎋',
  maize: '🌽',
  potato: '🥔',
  onion: '🧅',
  tomato: '🍅',
  mustard: '🌼',
  chickpea: '🫘',
  mango: '🥭',
  citrus: '🍊'
};

export const CropImage: React.FC<CropImageProps> = ({
  crop,
  className = '',
  frameClassName = 'w-full aspect-[16/10]'
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function resolveCropImage() {
      // 1. Check custom uploaded photo from localStorage or crop.image (Uploaded photo always takes priority)
      const uploadedCustom = localStorage.getItem(`crop_uploaded_img_${crop.id}`);
      if (uploadedCustom && !uploadedCustom.includes('unsplash.com')) {
        if (isMounted) {
          setImageUrl(uploadedCustom);
          setLoading(false);
        }
        return;
      }

      if (crop.image && crop.image.trim() !== '' && !crop.image.includes('unsplash.com')) {
        if (isMounted) {
          setImageUrl(crop.image);
          setLoading(false);
        }
        return;
      }

      // 2. Check cached Wikimedia Commons URL
      const cacheKey = `crop_wiki_img_${crop.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        if (cached === 'NOT_FOUND') {
          if (isMounted) {
            setFailed(true);
            setLoading(false);
          }
          return;
        }
        if (isMounted) {
          setImageUrl(cached);
          setLoading(false);
        }
        return;
      }

      // 3. Search Wikimedia Commons
      const primaryTerm = CROP_SEARCH_TERMS[crop.id] || `${crop.nameEn.split(' ')[0]} plant field`;
      const fallbackTerm = crop.nameEn.split(' ')[0];

      const searchWikimedia = async (term: string): Promise<string | null> => {
        const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
          term
        )}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`;

        const res = await fetch(endpoint);
        if (!res.ok) return null;
        const data = await res.json();

        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages) as any[];
          for (const page of pages) {
            const title = (page.title || '').toLowerCase();
            const info = page.imageinfo?.[0];
            if (!info) continue;

            const mime = (info.mime || '').toLowerCase();
            const isJpgOrPng = mime.includes('jpeg') || mime.includes('jpg') || mime.includes('png');
            if (!isJpgOrPng) continue;

            // Reject logos, maps, diagrams, drawings
            const isUnrelated =
              title.includes('logo') ||
              title.includes('map') ||
              title.includes('diagram') ||
              title.includes('drawing') ||
              title.includes('sketch') ||
              title.includes('icon') ||
              title.includes('badge') ||
              title.includes('vector') ||
              title.includes('flag');

            if (isUnrelated) continue;

            if (info.thumburl || info.url) {
              return info.thumburl || info.url;
            }
          }
        }
        return null;
      };

      try {
        let matched = await searchWikimedia(primaryTerm);
        if (!matched && fallbackTerm !== primaryTerm) {
          matched = await searchWikimedia(fallbackTerm);
        }

        if (matched) {
          localStorage.setItem(cacheKey, matched);
          if (isMounted) {
            setImageUrl(matched);
            setLoading(false);
          }
        } else {
          localStorage.setItem(cacheKey, 'NOT_FOUND');
          if (isMounted) {
            setFailed(true);
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setFailed(true);
          setLoading(false);
        }
      }
    }

    resolveCropImage();

    return () => {
      isMounted = false;
    };
  }, [crop.id, crop.nameEn, crop.image]);

  const handleImageError = () => {
    setFailed(true);
  };

  const cropEmoji = CROP_EMOJIS[crop.id] || '🌱';

  // If failed or no real picture found, show clean cream card with crop emoji/icon and full crop name
  if (failed || (!loading && !imageUrl)) {
    return (
      <div
        className={`${frameClassName} bg-[#FFFBEF] border border-[#E3D3A8] rounded-2xl flex flex-col items-center justify-center p-4 text-center select-none shadow-xs`}
      >
        <span className="text-4xl mb-2" role="img" aria-label={crop.nameEn}>
          {cropEmoji}
        </span>
        <span className="text-sm font-black text-[#0B3A17] line-clamp-2 max-w-[90%] leading-tight">
          {crop.nameEn}
        </span>
        <span className="text-[10px] font-bold text-[#1B6B2A] mt-1">
          {crop.season} Season • {crop.category}
        </span>
      </div>
    );
  }

  return (
    <div className={`${frameClassName} relative overflow-hidden bg-[#FFFBEF] rounded-2xl`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <Sprout className="w-8 h-8 text-gray-400 opacity-50" />
        </div>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={crop.nameEn}
          onError={handleImageError}
          onLoad={() => setLoading(false)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loading ? 'opacity-0' : 'opacity-100'
          } ${className}`}
        />
      )}
    </div>
  );
};
