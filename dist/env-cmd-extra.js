"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = exports.parseArgs = void 0;
const commander = __importStar(require("commander"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const packageJson = require('../package.json'); /* eslint-disable-line */
function parseArgs(args) {
    var _a, _b, _c;
    const program = new commander.Command();
    var command = program
        .version(packageJson.version, '-v, --version')
        .usage('[options] <command> [...args]')
        .option('-e, --env <env>', 'The environment to switch to.')
        .option('-i, --ignore [folders...]', 'Ignore these folders.')
        .option('-t, --test', 'Test only. No file operations.')
        .parse(args);
    // console.log('args', args)
    // console.log('command.opts()', command.opts())
    return {
        environment: (_a = command.opts().env) !== null && _a !== void 0 ? _a : '',
        ignore: (_b = command.opts().ignore) !== null && _b !== void 0 ? _b : [].map,
        test: (_c = command.opts().test) !== null && _c !== void 0 ? _c : false
    };
}
exports.parseArgs = parseArgs;
/**
 * Executes env - cmd using command line arguments
 * @export
 * @param {string[]} args Command line argument to pass in ['-f', './.env']
 * @returns {Promise<{ [key: string]: any }>}
 */
async function CLI(args) {
    var options = parseArgs(args);
    // console.log('options', JSON.stringify(options))
    try {
        return await EnvCmdExtra(options);
    }
    catch (e) {
        console.error(e);
        return process.exit(1);
    }
}
exports.CLI = CLI;
async function EnvCmdExtra(options) {
    console.log('TESTING ONLY. NO FILE OPERATIONS WILL BE EXECUTED');
    return processFiles(process.cwd(), options).then(() => {
        console.log('finished!');
    }).catch((err) => {
        console.log(err);
    });
}
function processFiles(dir, options) {
    return (0, promises_1.readdir)(dir).then((subdirs) => {
        return Promise.all(subdirs.map((subdir) => {
            let path = (0, path_1.resolve)(dir, subdir);
            if (options.ignore.some(x => x == subdir)) {
                console.log(`Ignoring ${path}`);
                return;
            }
            return (0, promises_1.stat)(path).then(async (stat) => {
                if (stat.isDirectory()) {
                    //console.log('IsDirectory')
                    processFiles(path, options);
                }
                else {
                    if (path.endsWith('.' + options.environment)) {
                        let newPath = path.substr(0, path.length - (options.environment.length + 1));
                        let orgPath = path.substr(0, path.length - (options.environment.length + 1)) + '.original';
                        if (!(0, fs_1.existsSync)(orgPath)) {
                            if (!options.test) {
                                console.log(`Saving ${newPath} to ${orgPath}`);
                                await (0, promises_1.copyFile)(newPath, orgPath);
                            }
                            else
                                console.log(`Would have saved ${newPath} to ${orgPath}`);
                        }
                        if (!options.test)
                            return (0, promises_1.copyFile)(path, newPath).then(() => {
                                console.log(`Copied ${path} to ${newPath}`);
                            })
                                .catch((err) => {
                                console.log(`ERROR Copying ${path} to ${newPath}. ${err}`);
                            });
                        else
                            console.log(`Would have copied ${path} to ${newPath}`);
                    }
                }
            });
            //return path;
        }));
    });
}
