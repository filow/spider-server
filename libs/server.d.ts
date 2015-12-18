
declare interface TaskItem {
  loc: string
}
declare module ClientNode {
  interface Id {
    key: string,
    ip: string,
    time: number
  }
  interface OsStat {
    platform: string,
    release: string,
    arch: string,
    node_version: string
  }
  
  interface DocumentsPerformance {
    total: number,
    success: number,
    failed: number,
    size: number,
    single_size: number
  }
  interface TimePerformance {
    crawl: number,
    loop: number
  }
  interface MemoryPerformance {
    free: number,
    usage: number,
    total: number
  }
  interface Performance {
    documents: DocumentsPerformance,
    time: TimePerformance,
    memory: MemoryPerformance,
    loadavg: number
  }
}

declare module Response {
  interface _Response {
    code: number,
    msg: string
  }
  interface Regist extends _Response {
    id?: string
  }
  interface GetTask extends _Response {
    items: TaskItem[]
  }
}