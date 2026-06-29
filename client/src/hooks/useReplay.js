import { useState, useRef, useCallback } from 'react';
import useBoardStore from '../store/boardStore';

export const useReplay = () => {
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const replayRef = useRef(null);

  const startReplay = useCallback((allElements, speed = 1) => {
    if (isReplaying || allElements.length === 0) return;

    const { setElements } = useBoardStore.getState();

    setIsReplaying(true);
    setElements([]);
    setReplayProgress(0);

    let i = 0;
    const delay = Math.max(30, 120 / speed);

    const step = () => {
      if (i >= allElements.length) {
        setIsReplaying(false);
        setReplayProgress(100);
        return;
      }

      const snapshot = allElements.slice(0, i + 1);
      useBoardStore.setState({ elements: snapshot });
      setReplayProgress(Math.round(((i + 1) / allElements.length) * 100));
      i++;

      replayRef.current = setTimeout(step, delay);
    };

    replayRef.current = setTimeout(step, delay);
  }, [isReplaying]);

  const stopReplay = useCallback(() => {
    if (replayRef.current) clearTimeout(replayRef.current);
    setIsReplaying(false);
  }, []);

  return { isReplaying, replayProgress, startReplay, stopReplay };
};