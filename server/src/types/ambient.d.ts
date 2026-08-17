declare module "streamifier";

declare module "pg" {
  export class Pool {
    constructor(options?: unknown);
  }
}
