export class Uint8ArrayUtils {
  static fromString(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  static toString(array: Uint8Array): string {
    return new TextDecoder().decode(array);
  }

  static toHexString(array: Uint8Array): string {
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  static concat(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
  }

  static compare(a: Uint8Array, b: Uint8Array): number {
    for (let i = 0; i < a.length && i < b.length; i++) {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    }
    return a.length - b.length;
  }
}
