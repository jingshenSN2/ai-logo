import React, { useEffect, useState } from 'react';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { fabric } from 'fabric';

interface ImageEditorProps {
  imageFile: File | null;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageFile }) => {
  const { editor, onReady } = useFabricJSEditor();
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const maxCanvasWidth = 800;
  const maxCanvasHeight = 600;

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    if (editor && imageSrc) {
      fabric.Image.fromURL(imageSrc, (img) => {
        const canvasWidth = editor.canvas.getWidth();
        const canvasHeight = editor.canvas.getHeight();

        let scale = 1;
        if (img.width > canvasWidth || img.height > canvasHeight) {
          const widthScale = canvasWidth / img.width;
          const heightScale = canvasHeight / img.height;
          scale = Math.min(widthScale, heightScale);
        }

        img.scale(scale);
        img.set({
          left: canvasWidth / 2 - (img.width * scale) / 2,
          top: canvasHeight / 2 - (img.height * scale) / 2,
          selectable: true,
        });

        editor.canvas.add(img);
        editor.canvas.setActiveObject(img);
        editor.canvas.renderAll();
      });
    }
  }, [editor, imageSrc]);

  return (
    <FabricJSCanvas className="sample-canvas" onReady={onReady} style={{ width: maxCanvasWidth, height: maxCanvasHeight }} />
  );
};

export default ImageEditor;
