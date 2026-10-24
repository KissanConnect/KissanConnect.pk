import React, { useState, useEffect } from 'react';
import { Tractor } from '../types';
import { Truck } from 'lucide-react';

interface TractorImageProps {
  tractor: Tractor;
  className?: string;
  frameClassName?: string;
}

export const TractorImage: React.FC<TractorImageProps> = ({
  tractor,
  className = '',
  frameClassName = 'w-full aspect-[4/3]'
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function resolveTractorImage() {
      // 1. Check custom uploaded photo from localStorage or tractor.image (Uploaded image always takes priority)
      const uploadedCustom = localStorage.getItem(`tractor_uploaded_img_${tractor.id}`);
      if (uploadedCustom && !uploadedCustom.includes('unsplash.com')) {
        if (isMounted) {
          setImageUrl(uploadedCustom);
          setLoading(false);
        }
        return;
      }

      if (tractor.image && tractor.image.trim() !== '' && !tractor.image.includes('unsplash.com')) {
        if (isMounted) {
          setImageUrl(tractor.image);
          setLoading(false);
        }
        return;
      }

      // 2. Check cached Wikimedia Commons URL
      const cacheKey = `tractor_wiki_img_${tractor.id}`;
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

      // 3. Build SEARCH_TERM according to tractor name
      // Examples: "Massey Ferguson 240 tractor", "Millat 385 tractor", "New Holland 640 tractor", "Fiat 480 tractor", "Belarus 510 tractor"
      const brandWord = tractor.brand.toLowerCase();
      let brandSearch = 'Tractor';
      if (brandWord.includes('massey') || brandWord.includes('mf') || brandWord.includes('millat')) {
        brandSearch = 'Massey Ferguson';
      } else if (brandWord.includes('holland') || brandWord.includes('al-ghazi')) {
        brandSearch = 'New Holland';
      } else if (brandWord.includes('fiat')) {
        brandSearch = 'Fiat';
      } else if (brandWord.includes('belarus')) {
        brandSearch = 'Belarus';
      } else if (brandWord.includes('bull')) {
        brandSearch = 'Tractor';
      }

      // Extract model numbers (e.g. 240, 260, 350, 360, 375, 385, 480, 640, 510, 820, 585, etc.)
      const modelNumMatch = tractor.model.match(/\d+/);
      const modelNum = modelNumMatch ? modelNumMatch[0] : '';
      const searchTerm = `${brandSearch} ${modelNum} tractor`.trim();

      try {
        const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
          searchTerm
        )}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();

        let matchedThumb: string | null = null;
        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages) as any[];

          for (const page of pages) {
            const title = (page.title || '').toLowerCase();
            const info = page.imageinfo?.[0];
            if (!info) continue;

            const mime = (info.mime || '').toLowerCase();
            const isJpgOrPng = mime.includes('jpeg') || mime.includes('jpg') || mime.includes('png');
            if (!isJpgOrPng) continue;

            // Reject logos, diagrams, maps, badges, icons, vectors, drawings
            const isUnrelated =
              title.includes('logo') ||
              title.includes('diagram') ||
              title.includes('map') ||
              title.includes('drawing') ||
              title.includes('symbol') ||
              title.includes('badge') ||
              title.includes('icon') ||
              title.includes('vector') ||
              title.includes('schematic') ||
              title.includes('flag') ||
              title.includes('seal');

            if (isUnrelated) continue;

            // Title must contain model number and brand keyword if model number is present
            const brandKeyword = brandSearch.toLowerCase().split(' ')[0]; // e.g. "massey", "new", "fiat", "belarus"
            const hasModel = modelNum ? title.includes(modelNum) : true;
            const hasBrand =
              title.includes(brandKeyword) ||
              title.includes('tractor') ||
              title.includes('mf') ||
              title.includes('fiat') ||
              title.includes('holland') ||
              title.includes('ferguson');

            if (hasModel && hasBrand && (info.thumburl || info.url)) {
              matchedThumb = info.thumburl || info.url;
              break;
            }
          }
        }

        if (matchedThumb) {
          localStorage.setItem(cacheKey, matchedThumb);
          if (isMounted) {
            setImageUrl(matchedThumb);
            setLoading(false);
          }
        } else {
          // If no matching real photo is found, do NOT show any unrelated picture.
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

    resolveTractorImage();

    return () => {
      isMounted = false;
    };
  }, [tractor.id, tractor.name, tractor.brand, tractor.model, tractor.image]);

  const handleImageError = () => {
    setFailed(true);
  };

  // If failed or no real picture found, show clean cream card with tractor icon and tractor's full name
  if (failed || (!loading && !imageUrl)) {
    return (
      <div
        className={`${frameClassName} bg-[#FFFBEF] border border-[#E3D3A8] rounded-2xl flex flex-col items-center justify-center p-4 text-center select-none shadow-xs`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E3D3A8] flex items-center justify-center text-[#1B6B2A] shadow-xs mb-2">
          <Truck className="w-6 h-6 stroke-[2]" />
        </div>
        <span className="text-xs font-black text-[#0B3A17] line-clamp-2 max-w-[90%] leading-tight">
          {tractor.name}
        </span>
        <span className="text-[10px] font-bold text-[#1B6B2A] mt-1">
          {tractor.horsepower} HP • {tractor.brand}
        </span>
      </div>
    );
  }

  return (
    <div className={`${frameClassName} relative overflow-hidden bg-[#FFFBEF] rounded-2xl`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <Truck className="w-8 h-8 text-gray-400 opacity-50" />
        </div>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={tractor.name}
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
