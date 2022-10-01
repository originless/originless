#!/usr/bin/env node

import { Command } from 'commander'
import { build } from 'originless'
// @ts-ignore
import pkg from '../package.json' assert { type: 'json' }

const program = new Command()

program.name('originless').description(pkg.description).version?.(pkg.version)

program
  .command('build', { isDefault: true })
  .description('Builds the originless application')
  .option('--include [glob]', 'Glob pattern to include files')
  .option('--plugins [plugins...]', 'Comma separated list of plugins')
  .action(async (options) => {
    await build(options)
  })

program.parse()
