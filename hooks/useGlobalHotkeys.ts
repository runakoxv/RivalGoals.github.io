
import { useEffect, useCallback } from 'react';

interface HotkeyDefinition {
  keys: string[]; // e.g., ['Alt', 's'] or ['Shift', 'N'] or ['Meta', 'k'] for Cmd+K
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

const useGlobalHotkeys = (hotkeys: HotkeyDefinition[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    hotkeys.forEach(hotkey => {
      // Ensure hotkey.keys is an array and all its elements are strings
      if (!Array.isArray(hotkey.keys) || !hotkey.keys.every(k => typeof k === 'string')) {
          console.warn('Invalid hotkey definition (keys array or its elements):', hotkey);
          return; // Skip this hotkey definition
      }
      const requiredKeys = hotkey.keys.map(k => k.toLowerCase());
      
      const pressedSpecialKeys = {
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey, // Command key on Mac, Windows key on Windows
        ctrl: event.ctrlKey,
      };

      // Ensure event.key is a string before calling toLowerCase()
      const mainKeyPressed = typeof event.key === 'string' && requiredKeys.includes(event.key.toLowerCase());
      
      let allSpecialKeysMatch = true;
      if (requiredKeys.includes('alt') !== pressedSpecialKeys.alt) allSpecialKeysMatch = false;
      if (requiredKeys.includes('shift') !== pressedSpecialKeys.shift) allSpecialKeysMatch = false;
      if (requiredKeys.includes('meta') !== pressedSpecialKeys.meta) allSpecialKeysMatch = false;
      if (requiredKeys.includes('ctrl') !== pressedSpecialKeys.ctrl) allSpecialKeysMatch = false;
      
      // Ensure that *only* the specified special keys are pressed
      if (pressedSpecialKeys.alt && !requiredKeys.includes('alt')) allSpecialKeysMatch = false;
      if (pressedSpecialKeys.shift && !requiredKeys.includes('shift')) allSpecialKeysMatch = false;
      if (pressedSpecialKeys.meta && !requiredKeys.includes('meta')) allSpecialKeysMatch = false;
      if (pressedSpecialKeys.ctrl && !requiredKeys.includes('ctrl')) allSpecialKeysMatch = false;


      if (mainKeyPressed && allSpecialKeysMatch) {
        if (hotkey.preventDefault !== false) { // Default to true
            event.preventDefault();
        }
        hotkey.callback(event);
      }
    });
  }, [hotkeys]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useGlobalHotkeys;
