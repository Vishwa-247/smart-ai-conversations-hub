
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Hook for animating new messages
export function useMessageAnimation(selector: string, dependencies: any[] = []) {
  useEffect(() => {
    const messages = document.querySelectorAll(selector);
    if (messages.length === 0) return;

    // Get newest message element
    const message = messages[messages.length - 1];
    
    // Create animation
    gsap.fromTo(
      message,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      }
    );
  }, [...dependencies]);
}

// Hook for animating sidebar
export function useSidebarAnimation(isOpen: boolean) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!sidebarRef.current) return;
    
    gsap.to(sidebarRef.current, {
      x: isOpen ? '0%' : '-100%',
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [isOpen]);
  
  return sidebarRef;
}

// Hook for typing animation
export function useTypingAnimation(text: string, isTyping: boolean, speed = 0.02) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!elementRef.current || !isTyping) return;
    
    // Reset content
    elementRef.current.textContent = '';
    
    // Type each character
    const characters = text.split('');
    let currentIndex = 0;
    
    const typeNextCharacter = () => {
      if (!elementRef.current) return;
      
      if (currentIndex < characters.length) {
        elementRef.current.textContent += characters[currentIndex];
        currentIndex++;
        setTimeout(typeNextCharacter, speed * 1000);
      }
    };
    
    typeNextCharacter();
  }, [text, isTyping, speed]);
  
  return elementRef;
}

// Hook for smooth transitions
export function useTransitionEffect(element: HTMLElement | null, enter: boolean) {
  useEffect(() => {
    if (!element) return;
    
    gsap.fromTo(
      element,
      {
        opacity: enter ? 0 : 1,
        y: enter ? 20 : 0,
      },
      {
        opacity: enter ? 1 : 0,
        y: enter ? 0 : 20,
        duration: 0.3,
        ease: 'power2.inOut',
      }
    );
  }, [element, enter]);
}
