import { type Plugin } from '@originless/types'

export const createPlugin = <T extends Plugin>(plugin: T): T => plugin
