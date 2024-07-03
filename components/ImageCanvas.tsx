import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaRedo, FaTrash, FaUndo } from "react-icons/fa"; // 引入FontAwesome图标

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

      // if not null and is an instance of Image
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
        if (typeof event.target?.result !== "string") {
          return;
        }
        addImageToCanvas(event.target?.result);
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
        </div>
      </div>
      <FabricJSCanvas className="sample-canvas" onReady={onReady} />
    </div>
  );
};

export default ImageCanvas;
