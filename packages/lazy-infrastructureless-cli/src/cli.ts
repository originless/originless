#!/usr/bin/env node

import { build } from '@lazy/infrastructureless'
import { Command } from 'commander'

const program = new Command()

const pkg = await import('../' + 'package.json', { assert: { type: 'json' } })
program.name('infrastructureless').description(pkg.description).version?.(pkg.version)

program
  .command('build')
  .description('Builds the infrastructureless application')
  .option('--include [glob]', 'Glob pattern to include files')
  .option('--plugins [plugins...]', 'Comma separated list of plugins')
  .action(async (options) => {
    await build(options)
  })

program.parse()
