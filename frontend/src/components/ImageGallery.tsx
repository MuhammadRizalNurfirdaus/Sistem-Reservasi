import { useState } from 'react';

interface GalleryImage {
    src: string;
    alt: string;
    caption?: string;
}

interface ImageGalleryProps {
    images: GalleryImage[];
    columns?: number;
}

export default function ImageGallery({ images, columns = 3 }: ImageGalleryProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
    };

    return (
        <>
            <div style={gridStyle}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="gallery-item"
                        onClick={() => setLightboxIndex(index)}
                    >
                        <img src={image.src} alt={image.alt} loading="lazy" />
                        <div className="gallery-item-overlay">
                            <span>{image.caption || image.alt}</span>
                        </div>
                    </div>
                ))}
            </div>

            {lightboxIndex !== null && (
                <div className="lightbox" onClick={() => setLightboxIndex(null)}>
                    <button
                        className="lightbox-close"
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
                    >
                        ✕
                    </button>
                    <img
                        src={images[lightboxIndex].src}
                        alt={images[lightboxIndex].alt}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
