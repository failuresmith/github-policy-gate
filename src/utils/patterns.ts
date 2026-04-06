export function findMatchingPatterns(
  text: string,
  patterns: string[],
): string[] {
  return patterns.filter((pattern) => textMatchesPattern(text, pattern));
}

export function textMatchesPattern(text: string, pattern: string): boolean {
  return new RegExp(pattern, 'i').test(text);
}
