import { useEffect, useRef } from 'react';

// ============================================================
//  useKeyboard Hook
//  Registers global keyboard shortcuts.
//  Uses a ref to store shortcuts so the listener is only added
//  once (no re-register on every render).
// ============================================================

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

export function useKeyboard(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  // Keep latest shortcuts in a ref so we never need to re-register the listener
  const shortcutsRef = useRef(shortcuts);
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger when user is typing in an input
      const target = event.target as HTMLElement;
      const isInputActive =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        const keyMatch = event.key === shortcut.key;
        const ctrlMatch = (shortcut.ctrlKey ?? false) === event.ctrlKey;
        const altMatch = (shortcut.altKey ?? false) === event.altKey;
        const shiftMatch = (shortcut.shiftKey ?? false) === event.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          // Allow Escape even from inputs
          if (isInputActive && shortcut.key !== 'Escape') continue;
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only re-register if enabled changes — NOT on shortcuts change
}

