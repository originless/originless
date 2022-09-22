declare module 'virtual:discord' {
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
}
