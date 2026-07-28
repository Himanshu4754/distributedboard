import { useRef, useEffect, useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Stage, Layer, Line, Rect, Circle, Ellipse, Text, Group } from 'react-konva';
import useBoardStore from '../../store/boardStore';
import { useCanvas } from '../../hooks/useCanvas';

const DOT_SPACING = 28;
const DOT_COLOR   = '#1e293b';

function DotGrid({ width, height }) {
  const dots = [];
  for (let x = DOT_SPACING; x < width; x += DOT_SPACING) {
    for (let y = DOT_SPACING; y < height; y += DOT_SPACING) {
      dots.push(
        <Circle key={`${x}-${y}`} x={x} y={y} radius={1.2} fill={DOT_COLOR} listening={false} />
      );
    }
  }
  return <>{dots}</>;
}

export default function Canvas({ emitDraw, emitCursor, stageRef, canEdit=true }) {
  const { elements, tool, color, addElement } = useBoardStore();

  // Inline text editor: { x, y, value } while placing a text element, else null.
  // Appears instantly (no native blocking dialog) right where the user clicked.
  const [textEditor, setTextEditor] = useState(null);
  const textInputRef = useRef(null);

  const openTextEditor = useCallback((x, y) => {
    setTextEditor({ x, y, value: '' });
  }, []);

  const { onMouseDown, onMouseMove, onMouseUp } =
    useCanvas({ emitDraw, emitCursor, onTextTool: openTextEditor });

  useEffect(() => {
    if (textEditor && textInputRef.current) textInputRef.current.focus();
  }, [textEditor]);

  const commitTextEditor = () => {
    const value = textEditor?.value.trim();
    if (value) {
      const element = {
        id: uuidv4(), tool: 'text',
        x: textEditor.x, y: textEditor.y,
        text: value, color, fontSize: 20, strokeWidth: 0,
      };
      addElement(element);
      emitDraw(element);
    }
    setTextEditor(null);
  };

  const cancelTextEditor = () => setTextEditor(null);

  const W = window.innerWidth  - 56;
  const H = window.innerHeight - 88; // top bar + status bar

  const handleMouseDown = useCallback((e) => {
    if (!canEdit) return;
    onMouseDown(e, stageRef);
  }, [onMouseDown, stageRef, canEdit]);
  const handleMouseMove = useCallback((e) => onMouseMove(e, stageRef), [onMouseMove, stageRef]);
  const handleMouseUp   = useCallback((e) => onMouseUp(e, stageRef),   [onMouseUp,   stageRef]);

  const getCursor = () => {
    if (tool === 'eraser') return 'cell';
    if (tool === 'text')   return 'text';
    return 'crosshair';
  };

  const renderElement = (el) => {
    const base = {
      key:         el.id,
      stroke:      el.color,
      strokeWidth: el.strokeWidth,
      lineCap:     'round',
      lineJoin:    'round',
      fill:        'transparent',
      listening:   false,
    };

    switch (el.tool) {
      case 'pencil':
        return <Line {...base} points={el.points} tension={0.4} />;

      case 'eraser':
        return (
          <Line
            {...base}
            key={el.id}
            points={el.points}
            tension={0.4}
            stroke={el.color}
            strokeWidth={el.strokeWidth}
            globalCompositeOperation="destination-out"
          />
        );

      case 'rect':
        return (
          <Rect
            {...base}
            key={el.id}
            x={el.x} y={el.y}
            width={el.width} height={el.height}
          />
        );

      case 'circle':
        return (
          <Ellipse
            {...base}
            key={el.id}
            x={el.x + (el.width  || 0) / 2}
            y={el.y + (el.height || 0) / 2}
            radiusX={Math.abs((el.width  || 0) / 2)}
            radiusY={Math.abs((el.height || 0) / 2)}
          />
        );

      case 'text':
        return (
          <Text
            key={el.id}
            x={el.x} y={el.y}
            text={el.text || ''}
            fontSize={el.fontSize || 20}
            fill={el.color}
            fontFamily="Inter, sans-serif"
            listening={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <Stage
        ref={stageRef}
        width={W}
        height={H}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{ background: '#0f172a', cursor: getCursor() }}
      >
        {/* Dot grid layer — never redraws */}
        <Layer listening={false}>
          <DotGrid width={W} height={H} />
        </Layer>

        {/* Drawing layer */}
        <Layer>
          {elements.map(renderElement)}
        </Layer>
      </Stage>

      {/* Instant inline text input — replaces the old blocking window.prompt */}
      {textEditor && (
        <input
          ref={textInputRef}
          value={textEditor.value}
          onChange={(e) => setTextEditor(t => ({ ...t, value: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitTextEditor();
            if (e.key === 'Escape') cancelTextEditor();
          }}
          onBlur={commitTextEditor}
          placeholder="Type text…"
          style={{
            position: 'absolute',
            left: textEditor.x,
            top: textEditor.y - 2,
            fontSize: 20,
            fontFamily: 'Inter, sans-serif',
            color,
            background: 'transparent',
            border: '1px dashed #6366f1',
            outline: 'none',
            padding: '0 2px',
            minWidth: 120,
          }}
        />
      )}
    </div>
  );
}