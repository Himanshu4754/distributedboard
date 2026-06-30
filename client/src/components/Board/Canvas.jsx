import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Group } from 'react-konva';
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
  const { elements, tool } = useBoardStore();
  const { onMouseDown, onMouseMove, onMouseUp } = useCanvas({ emitDraw, emitCursor });

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
          <Circle
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
  );
}