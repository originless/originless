import { type SlashCommand } from 'virtual:discord'

/* Send a random adorable animal photo */
export const handleBlep: SlashCommand<'/blep'> = async (
  /* The type of animal */
  animal: 'Dog' | 'Cat' | 'Penguin',
  /* Whether to show only baby animals */
  only_smol: boolean
) => {}
