export interface GetEnvVarOptions {
  envFile?: {
    filePath?: string
    fallback?: boolean
  }
  rc?: {
    environments: string[]
    filePath?: string
  }
  verbose?: boolean
}

export interface EnvCmdOptions extends GetEnvVarOptions {
  command: string
  commandArgs: string[]
  options?: {
    noOverride?: boolean
    useShell?: boolean
    verbose?: boolean
    expandEnvs?: boolean
  }
}
