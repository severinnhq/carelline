'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"

interface MatrixButtonProps {
  phrases?: string[];
  interval?: number;
  scrambleDuration?: number; // Keeping in interface since it's part of the public API
  onClick?: () => void;
  className?: string;
}

const MatrixButton: React.FC<MatrixButtonProps> = ({ 
  phrases = ["Kosárba teszem", "Rendelje meg mielőtt elfogy"],
  interval = 3000,
  // Removed unused scrambleDuration parameter while preserving it in the interface
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

  // Removed the unused getNextPhraseIndex function

  const startScrambleEffect = useCallback(() => {
    // Scramble effect logic is commented out - will not execute
    /*
    if (isScrambling || !isMountedRef.current) return;

    setIsScrambling(true);
    const nextIndex = getNextPhraseIndex();
    const targetPhrase = phrases[nextIndex];
    const startTime = Date.now();
    phraseIndexRef.current = nextIndex;

    const updateScramble = () => {
      if (!isMountedRef.current) return;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / scrambleDuration, 1);
      let result = "";
      const targetLength = targetPhrase.length;
      const finalizedChars = Math.floor(progress * targetLength);
      for (let i = 0; i < targetLength; i++) {
        result += (i < finalizedChars) 
          ? targetPhrase[i]
          : chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setDisplayText(result);
      if (progress < 1 && isMountedRef.current) {
        frameRef.current = requestAnimationFrame(updateScramble);
      } else if (isMountedRef.current) {
        setDisplayText(targetPhrase);
        setIsScrambling(false);
      }
    };
    updateScramble();
    */
  }, []); 

  useEffect(() => {
    isMountedRef.current = true;
    setDisplayText(phrases[0]); // Always set to first phrase ("Kosárba teszem")
    phraseIndexRef.current = 0;
    usedIndicesRef.current = new Set([0]);
    setIsScrambling(false);
    clearAllTimers();
    
    // Commented out the timer initialization that would start the scrambling effect
    /*
    initialTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        startScrambleEffect();
        intervalRef.current = setInterval(() => {
          if (isMountedRef.current) {
            startScrambleEffect();
          }
        }, interval);
      }
    }, 2000);
    */
    
    return () => {
      isMountedRef.current = false;
      clearAllTimers();
    };
  }, [interval, phrases, startScrambleEffect, clearAllTimers]);

  useEffect(() => {
    const handleResize = () => {
      // Resize handler is kept but simplified since we don't need to handle scrambling anymore
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