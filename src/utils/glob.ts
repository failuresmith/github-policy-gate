import picomatch from 'picomatch';

export function findMatches(paths: string[], globs: string[]): string[] {
  return paths.filter((candidate) => matchesAnyGlob(candidate, globs));
}

export function matchesAnyGlob(candidate: string, globs: string[]): boolean {
  return globs.some((glob) => picomatch(glob, { dot: true })(candidate));
}
