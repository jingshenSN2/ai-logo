import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';

// 定义 useImage 钩子
const useImage = (src: string | null) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      return;
    }
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImage(img);
    };
  }, [src]);

  return [image];
};

interface ImageEditorProps {
  imageFile: File | null;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageFile }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [image] = useImage(imageSrc);
  const imageRef = useRef<any>(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {image && (
          <KonvaImage
            image={image}
            x={100}
            y={100}
            draggable
            ref={imageRef}
          />
        )}
      </Layer>
    </Stage>
  );
};

export default ImageEditor;
