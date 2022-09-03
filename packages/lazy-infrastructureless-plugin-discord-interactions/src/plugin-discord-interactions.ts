// @ts-ignore
import pkg from '../package.json' assert { type: 'json' }

export default {
  name: pkg.name,
  version: pkg.version,
  identifier:
    'import { SlashCommand, UserCommand, MessageCommand } from "@lazy/infrastructureless-plugin-discord-interactions"',
}

export type SlashCommand<T extends `/${string}`> = unknown
export type UserCommand<T extends string> = unknown
export type MessageCommand<T extends string> = unknown

export type Channel = unknown
export type User = unknown
export type Role = unknown
export type Attachment = unknown

export type InteractionGuild = unknown
export type InteractionChannel = unknown
export type InteractionUser = unknown
export type InteractionMessage = unknown
