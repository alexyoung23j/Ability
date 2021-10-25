export function assert(bool: boolean, msg: string): asserts bool {
  if (!bool) {
    throw new Error(msg);
  }
}
