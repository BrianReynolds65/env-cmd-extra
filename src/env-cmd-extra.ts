import * as commander from 'commander'
import { existsSync } from 'fs';
import { readdir, stat, copyFile } from 'fs/promises';
import { resolve } from 'path';
import { urlToHttpOptions } from 'url';
const packageJson = require('../package.json') /* eslint-disable-line */

interface CmdOptions {
  environment?: string
  ignore: string[]
  test: boolean
}

export function parseArgs (args: string[]): CmdOptions {
  const program = new commander.Command() 
  var command = program
    .version(packageJson.version, '-v, --version')
    .usage('[options] <command> [...args]')
    .option('-e, --env <env>', 'The environment to switch to.')
    .option('-i, --ignore [folders...]', 'Ignore these folders.')
    .option('-t, --test', 'Test only. No file operations.')
    .parse(args)

    // console.log('args', args)
    // console.log('command.opts()', command.opts())
    return {
      environment:command.opts().env??'',
      ignore: command.opts().ignore??[].map,
      test: command.opts().test??false
    }
}

/**
 * Executes env - cmd using command line arguments
 * @export
 * @param {string[]} args Command line argument to pass in ['-f', './.env']
 * @returns {Promise<{ [key: string]: any }>}
 */
export async function CLI (args: string[]): Promise<void> {
  var options = parseArgs(args)
  // console.log('options', JSON.stringify(options))
  try {
    return await EnvCmdExtra(options)
  } catch (e) {
    console.error(e)
    return process.exit(1)
  }
}

async function EnvCmdExtra(options: CmdOptions): Promise<void>
{
  console.log('TESTING ONLY. NO FILE OPERATIONS WILL BE EXECUTED')
  return processFiles(process.cwd(), options).then(() => {
    console.log('finished!')
  }).catch((err) => {
    console.log(err)
  })
}

function processFiles(dir:string, options:CmdOptions) {
  return readdir(dir).then((subdirs) => {
    return Promise.all(subdirs.map((subdir) => {
      let path = resolve(dir, subdir)
      if (options.ignore.some(x => x == subdir)) {
        console.log(`Ignoring ${path}`)
        return
      }
      return stat(path).then(async(stat) => {
        if (stat.isDirectory()) {
          //console.log('IsDirectory')
          processFiles(path, options)
        }
        else {
          if (path.endsWith('.' + options.environment)) {
            let newPath = path.substr(0, path.length - (options!.environment!.length+1))
            let orgPath = path.substr(0, path.length - (options!.environment!.length+1)) + '.original'
            if (!existsSync(orgPath)) {
              if (!options.test) {
                console.log(`Saving ${newPath} to ${orgPath}`)
                await copyFile(newPath, orgPath)
              }
              else
                console.log(`Would have saved ${newPath} to ${orgPath}`)
            }
            if (!options.test)
              return copyFile(path, newPath).then(() => {
                console.log(`Copied ${path} to ${newPath}`)
              })
              .catch((err) => {
                console.log(`ERROR Copying ${path} to ${newPath}. ${err}`)
              })
            else
              console.log(`Would have copied ${path} to ${newPath}`)

          }
        }
      })
      //return path;
    }))
  })
}

