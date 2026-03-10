declare module 'argon2-wasm-pro' {
  export interface Argon2Options {
    pass: string;
    salt: Uint8Array;
    time: number;
    mem: number;
    parallelism: number;
    hashLen: number;
    type: number;
  }

  export interface Argon2Result {
    hash: Uint8Array;
    hashHex: string;
    encoded: string;
  }

  export function hash(options: Argon2Options): Promise<Argon2Result>;
  export function verify(options: { pass: string; encoded: string }): Promise<void>;

  const argon2: {
    hash: typeof hash;
    verify: typeof verify;
  };

  export default argon2;
}
