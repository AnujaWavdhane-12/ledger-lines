export const stringOrUndefined = (
  url: string | undefined
): string | undefined => (url ? `${url}` : undefined);
