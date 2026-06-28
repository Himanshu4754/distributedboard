import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Circle } from 'react-konva';
import useBoardStore from '../../store/boardStore';
import { useCanvas } from '../../hooks/useCanvas';

export default function Canvas({ emitDraw, emitCursor, stageRef }) {
  const { elements } = useBoardStore();
  const { onMouseDown, onMouseMove, onMouseUp } = useCanvas({ emitDraw, emitCursor });

  // Get stage dimensions
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    onMouseDown(e, stageRef);
  }, [onMouseDown, stageRef]);

  const handleMouseMove = useCallback((e) => {
    onMouseMove(e, stageRef);
  }, [onMouseMove, stageRef]);

  const handleMouseUp = useCallback((e) => {
    onMouseUp(e, stageRef);
  }, [onMouseUp, stageRef]);

  const renderElement = (el) => {
    const commonProps = {
      key: el.id,
      stroke: el.color,
      strokeWidth: el.strokeWidth,
      lineCap: 'round',
      lineJoin: 'round',
      fill: 'transparent',
      listening: false,
    };

    switch (el.tool) {
      case 'pencil':
      case 'eraser':
        return (
          <Line
            {...commonProps}
            key={el.id}
            points={el.points}
            tension={0.5}
            globalCompositeOperation={
              el.tool === 'eraser' ? 'destination-out' : 'source-over'
            }
          />
        );
      case 'rect':
        return (
          <Rect
            {...commonProps}
            key={el.id}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
          />
        );
      case 'circle':
        return (
          <Circle
            {...commonProps}
            key={el.id}
            x={el.x + (el.width || 0) / 2}
            y={el.y + (el.height || 0) / 2}
            radiusX={(el.width || 0) / 2}
            radiusY={(el.height || 0) / 2}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth - 64}
      height={window.innerHeight - 48}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      style={{ background: '#0f172a', cursor: 'crosshair' }}
    >
      <Layer>
        {elements.map(renderElement)}
      </Layer>
    </Stage>
  );
}