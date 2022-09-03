import { SlashCommand } from '@lazy/infrastructureless-plugin-discord-interactions'

/* Send a random adorable animal photo */
export const handleBlep: SlashCommand<'/blep'> = async (
  /* The type of animal */
  animal: 'Dog' | 'Cat' | 'Penguin',
  /* Whether to show only baby animals */
  only_smol: boolean
) => {}
;({
  file: '/Users/aidan.temple/projects/lazy-infrastructureless/examples/blep.handler.ts',
  definitions: [
    {
      type: 'function',
      name: 'handleBlep',
      description: 'Send a random adorable animal photo',
      annotation: {
        type: 'external',
        name: 'SlashCommand',
        source: '@lazy/infrastructureless-plugin-discord-interactions',
        generics: [
          {
            type: 'literal',
            value: '/blep',
            description: null,
          },
        ],
      },
      parameters: [
        {
          type: 'variable',
          name: 'animal',
          description: 'The type of animal',
          annotation: {
            type: 'union',
          },
        },
      ],
    },
  ],
})
