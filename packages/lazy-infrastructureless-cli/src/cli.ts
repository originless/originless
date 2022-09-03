#!/usr/bin/env node

import { build } from '@lazy/infrastructureless'
import { Command } from 'commander'
// @ts-ignore
import pkg from '../package.json' assert { type: 'json' }

const program = new Command()

program.name('infrastructureless').description(pkg.description).version?.(pkg.version)

program
  .command('build', { isDefault: true })
  .description('Builds the infrastructureless application')
  .option('--include [glob]', 'Glob pattern to include files')
  .option('--plugins [plugins...]', 'Comma separated list of plugins')
  .action(async (options) => {
    await build(options)
  })

program.parse()
