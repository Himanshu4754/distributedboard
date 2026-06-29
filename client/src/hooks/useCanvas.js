import { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useBoardStore from '../store/boardStore';

export const useCanvas = ({ emitDraw, emitCursor }) => {
  const isDrawing  = useRef(false);
  const startPos   = useRef({ x: 0, y: 0 });
  const currentId  = useRef(null);

  const getPos = useCallback((e, stageRef) => {
    const pos = stageRef.current.getPointerPosition();
    return { x: pos.x, y: pos.y };
  }, []);

  const onMouseDown = useCallback((e, stageRef) => {
    const { tool, color, strokeWidth, addElement } = useBoardStore.getState();
    const { x, y } = getPos(e, stageRef);

    // ── Text tool: prompt and place immediately ──────────────────────────
    if (tool === 'text') {
      const text = window.prompt('Enter text:');
      if (!text || !text.trim()) return;

      const element = {
        id:       uuidv4(),
        tool:     'text',
        x, y,
        text:     text.trim(),
        color,
        fontSize: 20,
        strokeWidth: 0,
      };

      addElement(element);
      emitDraw(element);
      return;
    }

    // ── All other tools ───────────────────────────────────────────────────
    isDrawing.current = true;
    startPos.current  = { x, y };
    currentId.current = uuidv4();

    if (tool === 'pencil' || tool === 'eraser') {
      addElement({
        id:          currentId.current,
        tool:        tool === 'eraser' ? 'eraser' : 'pencil',
        points:      [x, y],
        color:       tool === 'eraser' ? '#0f172a' : color,
        strokeWidth: tool === 'eraser' ? 28 : strokeWidth,
      });
    }
  }, [emitDraw, getPos]);

  const onMouseMove = useCallback((e, stageRef) => {
    const { x, y } = getPos(e, stageRef);
    emitCursor(x, y);

    if (!isDrawing.current) return;

    const { tool, color, strokeWidth, elements, updateLastElement, addElement } =
      useBoardStore.getState();

    if (tool === 'pencil' || tool === 'eraser') {
      const last = elements[elements.length - 1];
      if (!last || last.id !== currentId.current) return;
      updateLastElement({ ...last, points: [...last.points, x, y] });
      return;
    }

    if (tool === 'rect' || tool === 'circle') {
      const element = {
        id:          currentId.current,
        tool,
        x:           Math.min(x, startPos.current.x),
        y:           Math.min(y, startPos.current.y),
        width:       Math.abs(x - startPos.current.x),
        height:      Math.abs(y - startPos.current.y),
        color,
        strokeWidth,
      };

      const inProgress = elements.find(el => el.id === currentId.current);
      if (inProgress) {
        updateLastElement(element);
      } else {
        addElement(element);
      }
    }
  }, [emitCursor, getPos]);

  const onMouseUp = useCallback((e, stageRef) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const { elements } = useBoardStore.getState();
    const last = elements[elements.length - 1];
    if (last && last.id === currentId.current) {
      emitDraw(last);
    }
    currentId.current = null;
  }, [emitDraw]);

  return { onMouseDown, onMouseMove, onMouseUp };
};