'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"

interface MatrixButtonProps {
  phrases?: string[];
  interval?: number;
  scrambleDuration?: number;
  onClick?: () => void;
  className?: string;
}

const MatrixButton: React.FC<MatrixButtonProps> = ({ 
  phrases = ["Kosárba teszem", "Rendelje meg mielőtt elfogy"],
  interval = 3000,
  scrambleDuration = 1000,
  onClick,
  className = ""
}) => {
  // Always display the first phrase without changing
  const [displayText, setDisplayText] = useState(phrases[0]);
  
  // The following state and refs are kept but won't be used (commented logic)
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number | null>(null);
  const phraseIndexRef = useRef<number>(0);
  const usedIndicesRef = useRef<Set<number>>(new Set([0]));
  const isMountedRef = useRef<boolean>(true);

  const clearAllTimers = useCallback(() => {
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current);
      initialTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const getNextPhraseIndex = useCallback(() => {
    if (usedIndicesRef.current.size >= phrases.length) {
      usedIndicesRef.current = new Set();
    }
    let nextIndex = (phraseIndexRef.current + 1) % phrases.length;
    while (usedIndicesRef.current.has(nextIndex)) {
      nextIndex = (nextIndex + 1) % phrases.length;
    }
    usedIndicesRef.current.add(nextIndex);
    return nextIndex;
  }, [phrases.length]);

  const startScrambleEffect = useCallback(() => {
    // Scramble effect logic is commented out - will not execute
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    setDisplayText(phrases[0]); // Always set to first phrase ("Kosárba teszem")
    phraseIndexRef.current = 0;
    usedIndicesRef.current = new Set([0]);
    setIsScrambling(false);
    clearAllTimers();
    
    return () => {
      isMountedRef.current = false;
      clearAllTimers();
    };
  }, [phrases, clearAllTimers]);

  useEffect(() => {
    const handleResize = () => {
      if (isScrambling && isMountedRef.current) {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        setDisplayText(phrases[0]); // Always keep the first phrase
        setIsScrambling(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isScrambling, phrases]);

  return (
    <Button onClick={onClick} className={className}>
      <span className="text-lg max-[370px]:text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis">
        {displayText}
      </span>
    </Button>
  );
};

export default MatrixButton;
