/* eslint-disable no-prototype-builtins */

/**
 * This is used to prevent items with the same key from being added to an array.
 * Assumes the array is an array of objects.
 * Assumes the value is a string.
 * @param arr Array of objects
 * @param key string key to prevent duplicates of
 * @returns Array of objects with duplicates removed
 */
export function removeDuplicatesByKey(arr: Record<string, string>[], key: string) {
  const seen: Record<string, boolean> = {};
  return arr.filter((item) => {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}
