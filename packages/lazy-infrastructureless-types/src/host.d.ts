export interface Host {
  readFile: (path: string) => Promise<string>
  saveFile: (path: string, content: string) => Promise<void>
}
