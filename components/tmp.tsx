import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fabric } from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';

const MAX_HISTORY_LENGTH = 50;

const ImageCanvas = ({ imageFile, backgroundColor }) => {
  const { editor, onReady } = useFabricJSEditor();
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  const canvasContainerRef = useRef(null);

  const backgroundMap = {
    'white_t': '/white_t.jpg',
    'black_t': '/black_t.jpg',
    'grey_t': '/grey_t.jpg',
  };

  const resizeCanvas = useCallback(() => {
    if (editor && canvasContainerRef.current) {
      const containerWidth = canvasContainerRef.current.offsetWidth;
      const containerHeight = canvasContainerRef.current.offsetHeight;

      editor.canvas.setWidth(containerWidth);
      editor.canvas.setHeight(containerHeight);

      if (editor.canvas.backgroundImage) {
        const backgroundImage = editor.canvas.backgroundImage;
        const scaleFactor = containerWidth / backgroundImage.width;
        backgroundImage.scale(scaleFactor);
        backgroundImage.set({
          left: containerWidth / 2,
          top: containerHeight / 2,
          originX: 'center',
          originY: 'center',
        });
        editor.canvas.renderAll();
      }
    }
  }, [editor]);

  const addBackground = useCallback(() => {
    if (!editor || !fabric) {
      console.log('Editor or fabric not loaded');
      return;
    }

    const backgroundImageUrl = backgroundMap[backgroundColor] || backgroundMap['white_t'];

    fabric.Image.fromURL(backgroundImageUrl, (image) => {
      if (!image) {
        console.log('Image not loaded');
        return;
      }

      const containerWidth = canvasContainerRef.current ? canvasContainerRef.current.offsetWidth : 0;
      const containerHeight = canvasContainerRef.current ? canvasContainerRef.current.offsetHeight : 0;

      editor.canvas.setWidth(containerWidth);
      editor.canvas.setHeight(containerHeight);

      const scaleFactor = containerWidth / image.width;
      image.scale(scaleFactor);
      image.set({
        originX: 'center',
        originY: 'center',
        left: containerWidth / 2,
        top: containerHeight / 2,
      });

      editor.canvas.setBackgroundImage(image, editor.canvas.renderAll.bind(editor.canvas));
    });
  }, [editor, backgroundColor]);

  useEffect(() => {
    if (editor) {
      addBackground();

      const saveHistory = () => {
        if (!isUndoRedoAction) {
          const json = editor.canvas.toJSON();
          setHistory((prevHistory) => {
            const newHistory = prevHistory.length >= MAX_HISTORY_LENGTH
              ? prevHistory.slice(1).concat(json)
              : prevHistory.concat(json);
            return newHistory;
          });
          setRedoStack([]);
        }
      };

      const events = ['object:added', 'object:modified', 'object:removed'];
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
        fabric.Image.fromURL(event.target.result, (img) => {
          const containerWidth = canvasContainerRef.current.offsetWidth;
          const containerHeight = canvasContainerRef.current.offsetHeight;

          img.scaleToWidth(containerWidth / 3);
          img.scaleToHeight(containerHeight / 3);
          img.set({
            left: containerWidth / 2 - (img.getScaledWidth() / 2),
            top: containerHeight / 2 - (img.getScaledHeight() / 2),
            selectable: true,
          });

          editor.canvas.add(img);
          editor.canvas.renderAll();
          editor.canvas.setActiveObject(img);
        });
      };
      reader.readAsDataURL(imageFile);
    }
  }, [editor, imageFile]);

  const handleUndo = useCallback(() => {
    if (history.length > 1) {
      setIsUndoRedoAction(true);
      const prevState = history[history.length - 2];
      setRedoStack((prevRedoStack) => [...prevRedoStack, history[history.length - 1]]);
      setHistory((prevHistory) => prevHistory.slice(0, -1));

      editor.canvas.loadFromJSON(prevState, () => {
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

      editor.canvas.loadFromJSON(nextState, () => {
        editor.canvas.renderAll();
        setIsUndoRedoAction(false);
      });
    }
  }, [redoStack, editor]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey && e.key === 'z' && !e.shiftKey) {
        handleUndo();
      } else if (e.metaKey && e.key === 'z' && e.shiftKey) {
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
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
    <div ref={canvasContainerRef} style={{ width: '100%', height: '100vh' }}>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <FabricJSCanvas className="sample-canvas" onReady={onReady} />
    </div>
  );
};

export default ImageCanvas;
