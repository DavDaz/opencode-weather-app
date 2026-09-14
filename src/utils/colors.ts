const ANSI = {
  RESET: "\x1b[0m",
  CYAN: "\x1b[36m",
  YELLOW: "\x1b[33m",
  GREEN: "\x1b[32m",
  RED: "\x1b[31m",
} as const;

function colorize(color: string, text: string): string {
  return `${color}${text}${ANSI.RESET}`;
}

export function menu(text: string): string {
  return colorize(ANSI.CYAN, text);
}

export function loading(text: string): string {
  return colorize(ANSI.CYAN, text);
}

export function temperature(text: string): string {
  return colorize(ANSI.YELLOW, text);
}

export function success(text: string): string {
  return colorize(ANSI.GREEN, text);
}

export function failure(text: string): string {
  return colorize(ANSI.RED, text);
}
