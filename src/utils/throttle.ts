
// Prosty throttle bez problemów z closure
export function createThrottle(delay: number = 16) {
  let lastCall = 0;
  
  return function<T extends (...args: any[]) => any>(func: T) {
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func(...args);
      }
    };
  };
}

// Simple throttle function for direct use
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  delay: number = 16
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}
