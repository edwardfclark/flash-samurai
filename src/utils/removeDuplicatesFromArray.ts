/* eslint-disable no-prototype-builtins */

/**
 * This is used to prevent items with the same key from being added to an array.
 * @param arr Array of objects
 * @param key string key to prevent duplicates of
 * @returns Array of objects with duplicates removed
 */
export function removeDuplicatesFromArray(arr: Record<string, any>[], key: string) {
  const seen: Record<string, boolean> = {};
  return arr.filter((item) => {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}
