import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaRedo, FaTrash, FaUndo, FaMagic } from "react-icons/fa";

const MAX_HISTORY_LENGTH = 50;

type ImageCanvasProps = {
  imageFile: File | null;
};

type CanvasHistory = {
  version: string;
  objects: fabric.Object[];
};

const ImageCanvas = ({ imageFile }: ImageCanvasProps) => {
  const { editor, onReady } = useFabricJSEditor();
  const [history, setHistory] = useState([] as CanvasHistory[]);
  const [redoStack, setRedoStack] = useState([] as CanvasHistory[]);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("white_t");
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const backgroundMap: Record<string, string> = {
    white_t: "/white_t.jpg",
    black_t: "/black_t.jpg",
    grey_t: "/grey_t.jpg",
  };

  const resizeCanvas = useCallback(() => {
    if (editor && canvasContainerRef.current) {
      const containerWidth = canvasContainerRef.current.offsetWidth;
      const containerHeight = canvasContainerRef.current.offsetHeight;

      editor.canvas.setWidth(containerWidth);
      editor.canvas.setHeight(containerHeight);

      if (editor.canvas.backgroundImage instanceof fabric.Image) {
        const backgroundImage = editor.canvas.backgroundImage;
        const scaleFactor =
          containerWidth / (backgroundImage.width ?? containerWidth);
        backgroundImage.scale(scaleFactor);
        backgroundImage.set({
          left: containerWidth / 2,
          top: containerHeight / 2,
          originX: "center",
          originY: "center",
        });
        editor.canvas.renderAll();
      }
    }
  }, [editor]);

  const addBackground = useCallback(() => {
    if (!editor || !fabric) {
      console.log("Editor or fabric not loaded");
      return;
    }

    const backgroundImageUrl =
      backgroundMap[backgroundColor] || backgroundMap["white_t"];

    fabric.Image.fromURL(backgroundImageUrl, (image) => {
      if (!image) {
        console.log("Image not loaded");
        return;
      }

      const containerWidth = canvasContainerRef.current
        ? canvasContainerRef.current.offsetWidth
        : 0;
      const containerHeight = canvasContainerRef.current
        ? canvasContainerRef.current.offsetHeight
        : 0;

      editor.canvas.setWidth(containerWidth);
      editor.canvas.setHeight(containerHeight);

      const scaleFactor = containerWidth / (image.width ?? containerWidth);
      image.scale(scaleFactor);
      image.set({
        originX: "center",
        originY: "center",
        left: containerWidth / 2,
        top: containerHeight / 2,
      });

      editor.canvas.setBackgroundImage(
        image,
        editor.canvas.renderAll.bind(editor.canvas)
      );
    });
  }, [editor, backgroundColor]);

  const addImageToCanvas = useCallback(
    (url: string) => {
      fabric.Image.fromURL(url, (img) => {
        const containerWidth = canvasContainerRef.current
          ? canvasContainerRef.current.offsetWidth
          : 0;
        const containerHeight = canvasContainerRef.current
          ? canvasContainerRef.current.offsetHeight
          : 0;

        img.scaleToWidth(containerWidth / 3);
        img.scaleToHeight(containerHeight / 3);
        img.set({
          left: containerWidth / 2 - img.getScaledWidth() / 2,
          top: containerHeight / 2 - img.getScaledHeight() / 2,
          selectable: true,
          opacity: 0.9,
        });

        editor?.canvas.add(img);
        editor?.canvas.renderAll();
        editor?.canvas.setActiveObject(img);
      });
    },
    [editor]
  );

  const handleRemoveBackground = useCallback(async () => {
    console.log('handleRemoveBackground 被调用');
    if (!editor) {
      console.log('编辑器未初始化');
      return;
    }

    const activeObject = editor.canvas.getActiveObject();
    if (!(activeObject instanceof fabric.Image)) {
      console.log('没有选中图像对象');
      alert('请选择一个图像以移除背景。');
      return;
    }

    setIsRemovingBackground(true);

    try {
      console.log('开始移除背景过程');

      // 获取原始图像格式
      const originalFormat = (activeObject as fabric.Image).getSrc().split('.').pop()?.toLowerCase() || 'png';
      
      // 将 Fabric.js 图像对象转换为 Blob，使用原始格式
      const dataURL = (activeObject as fabric.Image).toDataURL({ format: originalFormat as 'png' | 'jpeg' });
      const blob = await fetch(dataURL).then(res => res.blob());
      console.log('图像已转换为 Blob');

      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('file', blob, 'image.png');
      console.log('FormData 已创建');

      // 发送请求到我们的 API 路由
      console.log('正在发送请求到 API');
      const response = await fetch('/api/proxy/removebg', {
        method: 'POST',
        body: formData,
      });

      console.log('收到 API 响应:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`移除背景失败: ${response.status} ${response.statusText}`);
      }

      // 获取处理后的图像数据
      const resultBlob = await response.blob();
      console.log('已接收处理后的图像数据');

      const url = URL.createObjectURL(resultBlob);

      // 加载处理后的图像
      fabric.Image.fromURL(url, (img) => {
        console.log('正在将处理后的图像添加到画布');
        // 保持原始图像的位置和大小
        img.set({
          left: activeObject.left,
          top: activeObject.top,
          scaleX: activeObject.scaleX,
          scaleY: activeObject.scaleY,
          angle: activeObject.angle,
          selectable: true,
        });

        // 替换原始图像
        editor.canvas.remove(activeObject);
        editor.canvas.add(img);
        editor.canvas.setActiveObject(img);
        editor.canvas.renderAll();
        console.log('背景移除完成');
      });

    } catch (error) {
      console.error('移除背景时出错:', error);
      alert('移除背景失败。请重试。');
    } finally {
      setIsRemovingBackground(false);
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      addBackground();

      const saveHistory = () => {
        if (!isUndoRedoAction) {
          const json = editor.canvas.toJSON();
          setHistory((prevHistory) => {
            const newHistory =
              prevHistory.length >= MAX_HISTORY_LENGTH
                ? prevHistory.slice(1).concat(json)
                : prevHistory.concat(json);
            return newHistory;
          });
          setRedoStack([]);
        }
      };

      const events = ["object:added", "object:modified", "object:removed"];
      events.forEach((event) => editor.canvas.on(event, saveHistory));

      return () => {
        events.forEach((event) => editor.canvas.off(event, saveHistory));
      };
    }
  }, [editor, addBackground, isUndoRedoAction]);

  useEffect(() => {
    if (editor && imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          addImageToCanvas(event.target?.result);
        }
      };
      reader.readAsDataURL(imageFile);
    }
  }, [editor, imageFile, addImageToCanvas]);

  const handleUndo = useCallback(() => {
    if (history.length > 1) {
      setIsUndoRedoAction(true);
      const prevState = history[history.length - 2];
      setRedoStack((prevRedoStack) => [
        ...prevRedoStack,
        history[history.length - 1],
      ]);
      setHistory((prevHistory) => prevHistory.slice(0, -1));

      editor?.canvas.loadFromJSON(prevState, () => {
        editor.canvas.renderAll();
        setIsUndoRedoAction(false);
      });
    }
  }, [history, editor]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      setIsUndoRedoAction(true);
      const nextState = redoStack[redoStack.length - 1];
      setRedoStack((prevRedoStack) => prevRedoStack.slice(0, -1));
      setHistory((prevHistory) => [...prevHistory, nextState]);

      editor?.canvas.loadFromJSON(nextState, () => {
        editor.canvas.renderAll();
        setIsUndoRedoAction(false);
      });
    }
  }, [redoStack, editor]);

  const handleDelete = useCallback(() => {
    const activeObject = editor?.canvas.getActiveObject();
    if (activeObject) {
      editor?.canvas.remove(activeObject);
      editor?.canvas.renderAll();
    }
  }, [editor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "z" && !e.shiftKey) {
        handleUndo();
      } else if (e.metaKey && e.key === "z" && e.shiftKey) {
        handleRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        handleDelete();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo, handleDelete]);

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas, editor]);

  useEffect(() => {
    if (editor) {
      addBackground();
    }
  }, [backgroundColor, editor, addBackground]);

  useEffect(() => {
    if (editor) {
      console.log('编辑器已初始化');
    }
  }, [editor]);

  return (
    <div
      ref={canvasContainerRef}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      <div className="absolute top-2 left-2 z-10">
        <div className="flex items-center space-x-3">
          <div
            className={`w-6 h-6 rounded-full bg-white border cursor-pointer ${
              backgroundColor === "white_t" ? "border-black" : ""
            }`}
            onClick={() => setBackgroundColor("white_t")}
          />
          <div
            className={`w-6 h-6 rounded-full bg-black border cursor-pointer ${
              backgroundColor === "black_t" ? "border-black" : ""
            }`}
            onClick={() => setBackgroundColor("black_t")}
          />
          <div
            className={`w-6 h-6 rounded-full bg-gray-500 border cursor-pointer ${
              backgroundColor === "grey_t" ? "border-black" : ""
            }`}
            onClick={() => setBackgroundColor("grey_t")}
          />
        </div>
      </div>
      <div className="absolute top-2 right-2 z-10">
        <div className="flex items-center space-x-10">
          <FaUndo onClick={handleUndo} className="cursor-pointer" />
          <FaRedo onClick={handleRedo} className="cursor-pointer" />
          <FaTrash onClick={handleDelete} className="cursor-pointer" />
          <FaMagic 
            onClick={handleRemoveBackground} 
            className={`cursor-pointer ${isRemovingBackground ? 'opacity-50' : ''}`}
            title="Remove Background"
          />
        </div>
      </div>
      <FabricJSCanvas className="sample-canvas" onReady={onReady} />
    </div>
  );
};

export default ImageCanvas;