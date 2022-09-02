// @ts-ignore
import esmock from 'esmock'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { type Configuration, type getConfiguration } from './configuration.js'

const createGetConfiguration = (
  configuration?: Partial<Configuration>
): Promise<typeof getConfiguration> =>
  esmock('./configuration.js', {
    lilconfig: { lilconfig: () => ({ search: async () => ({ config: configuration }) }) },
  }).then((module: typeof import('./configuration.js')) => module.getConfiguration)

describe('getConfiguration', () => {
  it('uses the default configuration', async () => {
    const getConfiguration = await createGetConfiguration()

    assert.deepStrictEqual(await getConfiguration(), {
      include: ['src/**/*.handler.ts'],
      exclude: ['node_modules/**'],
      plugins: [],
    })
  })

  it('uses the configuration file', async () => {
    const getConfiguration = await createGetConfiguration({ include: ['src/**/*.api.ts'] })

    assert.deepStrictEqual(await getConfiguration(), {
      include: ['src/**/*.api.ts'],
      exclude: ['node_modules/**'],
      plugins: [],
    })
  })

  it('uses the overrides', async () => {
    const getConfiguration = await createGetConfiguration({ include: ['src/**/*.api.ts'] })

    assert.deepStrictEqual(await getConfiguration({ include: ['src/**/*.command.ts'] }), {
      include: ['src/**/*.api.ts', 'src/**/*.command.ts'],
      exclude: ['node_modules/**'],
      plugins: [],
    })

    assert.deepStrictEqual(
      await getConfiguration({ plugins: ['@lazy/infrastructure-plugin-example-1'] }),
      {
        include: ['src/**/*.api.ts'],
        exclude: ['node_modules/**'],
        plugins: ['@lazy/infrastructure-plugin-example-1'],
      }
    )
  })

  it('deep merges with uniqueness', async () => {
    const getConfiguration = await createGetConfiguration({
      include: ['src/**/*.api.ts'],
      plugins: ['@lazy/infrastructure-plugin-example-1'],
    })

    assert.deepStrictEqual(
      await getConfiguration({
        include: ['src/**/*.command.ts'],
        plugins: ['@lazy/infrastructure-plugin-example-1'],
      }),
      {
        include: ['src/**/*.api.ts', 'src/**/*.command.ts'],
        exclude: ['node_modules/**'],
        plugins: ['@lazy/infrastructure-plugin-example-1'],
      }
    )

    assert.deepStrictEqual(
      await getConfiguration({ plugins: ['@lazy/infrastructure-plugin-example-2'] }),
      {
        include: ['src/**/*.api.ts'],
        exclude: ['node_modules/**'],
        plugins: ['@lazy/infrastructure-plugin-example-1', '@lazy/infrastructure-plugin-example-2'],
      }
    )

    assert.deepStrictEqual(
      await getConfiguration({
        plugins: ['@lazy/infrastructure-plugin-example-1', '@lazy/infrastructure-plugin-example-2'],
      }),
      {
        include: ['src/**/*.api.ts'],
        exclude: ['node_modules/**'],
        plugins: ['@lazy/infrastructure-plugin-example-1', '@lazy/infrastructure-plugin-example-2'],
      }
    )
  })

  it('strips unknown properties', async () => {
    const getConfiguration = await createGetConfiguration({
      unknown: 'src/**/*.api.ts',
    } as unknown as Configuration)

    assert.deepStrictEqual(await getConfiguration(), {
      include: ['src/**/*.handler.ts'],
      exclude: ['node_modules/**'],
      plugins: [],
    })
  })
})
