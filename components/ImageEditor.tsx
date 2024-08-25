import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import React, { useEffect, useState } from "react";

interface ImageEditorProps {
  imageFile: File | null;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageFile }) => {
  const { editor, onReady } = useFabricJSEditor();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      loadImageToCanvas(imageSrc);
    }
  }, [editor, imageSrc]);

  const loadImageToCanvas = (src: string) => {
    fabric.Image.fromURL(src, (img) => {
      const canvasWidth = editor!.canvas.getWidth();
      const canvasHeight = editor!.canvas.getHeight();
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

      editor!.canvas.clear();
      editor!.canvas.add(img);
      editor!.canvas.setActiveObject(img);
      editor!.canvas.renderAll();
    });
  };

  const handleRemoveBackground = async () => {
    if (!imageFile) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('/api/protected/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to remove background');
      }

      const blob = await response.blob();
      const newImageSrc = URL.createObjectURL(blob);
      setImageSrc(newImageSrc);
      loadImageToCanvas(newImageSrc);
    } catch (error) {
      console.error('Error removing background:', error);
      alert('Failed to remove background. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ width: maxCanvasWidth, height: maxCanvasHeight }}>
        <FabricJSCanvas className="sample-canvas" onReady={onReady} />
      </div>
      <button 
        onClick={handleRemoveBackground} 
        disabled={!imageFile || isLoading}
        style={{ marginTop: '10px' }}
      >
        {isLoading ? 'Processing...' : 'Remove Background'}
      </button>
    </div>
  );
};

export default ImageEditor;