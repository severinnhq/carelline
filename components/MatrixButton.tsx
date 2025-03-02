'use client'

import { useState, useEffect, useRef } from 'react'
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
  interval = 3000, // Time between scramble effects (ms) after the initial 2 sec delay
  scrambleDuration = 1000, // How long the scrambling effect lasts (ms)
  onClick,
  className = ""
}) => {
  // Display the first phrase immediately
  const [displayText, setDisplayText] = useState(phrases[0])
  const [isScrambling, setIsScrambling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const frameRef = useRef<number | null>(null)
  const phraseIndexRef = useRef<number>(0)
  const usedIndicesRef = useRef<Set<number>>(new Set([0])) // Start with first phrase marked as used
  const isMountedRef = useRef<boolean>(true)
  
  // Characters to use for scrambling effect
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"
  
  useEffect(() => {
    isMountedRef.current = true;
    
    // Reset state when component mounts or when phrases change
    setDisplayText(phrases[0]);
    phraseIndexRef.current = 0;
    usedIndicesRef.current = new Set([0]);
    setIsScrambling(false);
    
    // Clear any existing timers
    clearAllTimers();
    
    // Wait 2 seconds before starting the scramble effect for the first time.
    initialTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        startScrambleEffect();
        // Then schedule subsequent scramble effects every `interval` milliseconds.
        intervalRef.current = setInterval(() => {
          if (isMountedRef.current) {
            startScrambleEffect();
          }
        }, interval);
      }
    }, 2000);
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      clearAllTimers();
    };
  }, [interval, scrambleDuration, phrases]);
  
  // Function to clear all timers
  const clearAllTimers = () => {
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
  };
  
  // Chooses the next phrase index without immediate repetition.
  const getNextPhraseIndex = () => {
    if (usedIndicesRef.current.size >= phrases.length) {
      usedIndicesRef.current = new Set();
    }
    let nextIndex = (phraseIndexRef.current + 1) % phrases.length;
    while (usedIndicesRef.current.has(nextIndex)) {
      nextIndex = (nextIndex + 1) % phrases.length;
    }
    usedIndicesRef.current.add(nextIndex);
    return nextIndex;
  };
  
  // Starts the scramble effect transitioning to the next phrase.
  const startScrambleEffect = () => {
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
        // Once done, finalize the text and reset scrambling.
        setDisplayText(targetPhrase);
        setIsScrambling(false);
      }
    };
    
    updateScramble();
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // If in the middle of scrambling when resize happens, reset to current phrase
      if (isScrambling && isMountedRef.current) {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        
        const currentPhrase = phrases[phraseIndexRef.current];
        setDisplayText(currentPhrase);
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