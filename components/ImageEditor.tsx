import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import React, { useEffect, useState } from "react";

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
        const imgHeight = img.height || canvasHeight;
        const imgWidth = img.width || canvasWidth;

        let scale = 1;
        if (imgWidth > canvasWidth || imgHeight > canvasHeight) {
          const widthScale = canvasWidth / imgWidth;
          const heightScale = canvasHeight / imgHeight;
          scale = Math.min(widthScale, heightScale);
        }

        img.scale(scale);
        img.set({
          left: canvasWidth / 2 - (imgWidth * scale) / 2,
          top: canvasHeight / 2 - (imgHeight * scale) / 2,
          selectable: true,
        });

        editor.canvas.add(img);
        editor.canvas.setActiveObject(img);
        editor.canvas.renderAll();
      });
    }
  }, [editor, imageSrc]);

  return (
    <div style={{ width: maxCanvasWidth, height: maxCanvasHeight }}>
      <FabricJSCanvas className="sample-canvas" onReady={onReady} />
    </div>
  );
};

export default ImageEditor;
