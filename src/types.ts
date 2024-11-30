import { Command } from 'commander'

// Define an export type
export type Environment = Partial<Record<string, string | number | boolean>>

export type RCEnvironment = Partial<Record<string, Environment>>

export interface CommanderOptions extends Command {
  override?: boolean // Default: false
  useShell?: boolean // Default: false
  expandEnvs?: boolean // Default: false
  verbose?: boolean // Default: false
  silent?: boolean // Default: false
  fallback?: boolean // Default false
  environments?: string[]
  rcFile?: string
  file?: string
}

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
    noOverride?: boolean
    silent?: boolean
    useShell?: boolean
    verbose?: boolean
  }
}
