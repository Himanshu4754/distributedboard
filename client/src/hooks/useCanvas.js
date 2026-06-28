import { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useBoardStore from '../store/boardStore';

export const useCanvas = ({ emitDraw, emitCursor }) => {
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentId = useRef(null);

  const { tool, color, strokeWidth, addElement, updateLastElement } = useBoardStore();

  const getPos = useCallback((e, stageRef) => {
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    return { x: pos.x, y: pos.y };
  }, []);

  const onMouseDown = useCallback((e, stageRef) => {
    isDrawing.current = true;
    const { x, y } = getPos(e, stageRef);
    startPos.current = { x, y };
    currentId.current = uuidv4();

    if (tool === 'pencil' || tool === 'eraser') {
      const element = {
        id: currentId.current,
        tool: tool === 'eraser' ? 'eraser' : 'pencil',
        points: [x, y],
        color: tool === 'eraser' ? '#0f172a' : color,
        strokeWidth: tool === 'eraser' ? 24 : strokeWidth,
      };
      addElement(element);
    }
  }, [tool, color, strokeWidth, addElement, getPos]);

  const onMouseMove = useCallback((e, stageRef) => {
    const { x, y } = getPos(e, stageRef);
    emitCursor(x, y);

    if (!isDrawing.current) return;

    if (tool === 'pencil' || tool === 'eraser') {
      // Update last element's points array
      const store = useBoardStore.getState();
      const last = store.elements[store.elements.length - 1];
      if (!last || last.id !== currentId.current) return;
      updateLastElement({ ...last, points: [...last.points, x, y] });
    } else if (tool === 'rect' || tool === 'circle') {
      const store = useBoardStore.getState();
      const elements = store.elements;
      const inProgress = elements.find(el => el.id === currentId.current);

      const element = {
        id: currentId.current,
        tool,
        x: Math.min(x, startPos.current.x),
        y: Math.min(y, startPos.current.y),
        width: Math.abs(x - startPos.current.x),
        height: Math.abs(y - startPos.current.y),
        color,
        strokeWidth,
      };

      if (inProgress) {
        updateLastElement(element);
      } else {
        addElement(element);
      }
    }
  }, [tool, color, strokeWidth, addElement, updateLastElement, getPos, emitCursor]);

  const onMouseUp = useCallback((e, stageRef) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const store = useBoardStore.getState();
    const last = store.elements[store.elements.length - 1];

    if (last && last.id === currentId.current) {
      emitDraw(last);
    }

    currentId.current = null;
  }, [emitDraw]);

  return { onMouseDown, onMouseMove, onMouseUp };
};