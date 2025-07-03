import type { Command } from '@commander-js/extra-typings'

// Define an export type
export type Environment = Partial<Record<string, string>>

export type RCEnvironment = Partial<Record<string, Environment>>

export type CommanderOptions = Command<[], {
  environments?: true | string[]
  expandEnvs?: boolean // Default: false
  recursive?: boolean // Default: false
  fallback?: boolean // Default false
  file?: true | string
  override?: boolean // Default: false
  silent?: boolean // Default: false
  useShell?: boolean // Default: false
  verbose?: boolean // Default: false
}>

export interface RCFileOptions {
  environments: string[]
  filePath?: string
}

export interface EnvFileOptions {
  filePath?: string
  fallback?: boolean
}

export interface GetEnvVarOptions {
  envFile?: EnvFileOptions
  rc?: RCFileOptions
  verbose?: boolean
}

export interface EnvCmdOptions extends GetEnvVarOptions {
  command: string
  commandArgs: string[]
  options?: {
    expandEnvs?: boolean
    recursive?: boolean
    noOverride?: boolean
    silent?: boolean
    useShell?: boolean
    verbose?: boolean
  }
}
