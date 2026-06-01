/**
 * 简易日志工具 - 用于战役推演系统的关键路径日志记录
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  module?: string;
  action?: string;
  data?: any;
}

const LOG_PREFIX = '[江城危急]';
const ENABLED = process.env.NODE_ENV !== 'production';

function formatMessage(level: LogLevel, module: string, action: string, data?: any): string {
  const timestamp = new Date().toISOString().substring(11, 23);
  const levelTag = `[${level.toUpperCase()}]`;
  const moduleTag = `[${module}]`;
  const actionTag = `[${action}]`;
  
  let message = `${LOG_PREFIX} ${timestamp} ${levelTag} ${moduleTag} ${actionTag}`;
  if (data) {
    message += ` ${typeof data === 'string' ? data : JSON.stringify(data)}`;
  }
  return message;
}

function log(level: LogLevel, module: string, action: string, data?: any) {
  if (!ENABLED) return;
  
  const message = formatMessage(level, module, action, data);
  
  switch (level) {
    case 'info':
      console.info(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    case 'error':
      console.error(message);
      break;
    case 'debug':
      console.debug(message);
      break;
  }
}

export const logger = {
  info: (module: string, action: string, data?: any) => log('info', module, action, data),
  warn: (module: string, action: string, data?: any) => log('warn', module, action, data),
  error: (module: string, action: string, data?: any) => log('error', module, action, data),
  debug: (module: string, action: string, data?: any) => log('debug', module, action, data),
};

export default logger;
