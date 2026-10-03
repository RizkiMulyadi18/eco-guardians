/**
 * Simple tagged logger
 */
export const logger = {
  info: (tag, ...args) => console.log(`%c[${tag}]`, 'color: #4CAF50; font-weight: bold;', ...args),
  warn: (tag, ...args) => console.warn(`%c[${tag}]`, 'color: #FF9800; font-weight: bold;', ...args),
  error: (tag, ...args) => console.error(`%c[${tag}]`, 'color: #F44336; font-weight: bold;', ...args),
  debug: (tag, ...args) => console.debug(`%c[${tag}]`, 'color: #2196F3; font-weight: bold;', ...args),
};
