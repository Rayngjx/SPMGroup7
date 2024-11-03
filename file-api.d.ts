declare module 'file-api' {
  export class File {
    constructor(options: { name: string; type: string; buffer: Buffer });
  }
}
