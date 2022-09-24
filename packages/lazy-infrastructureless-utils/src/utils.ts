import { type Plugin } from '@lazy/infrastructureless-types'

export const createPlugin = <T extends Plugin>(plugin: T): T => plugin
