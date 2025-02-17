# env-cmd-extra
A derivative of env-cmd, designed to use specific config files when using specific environments.
It can also rename any files thatr have the form "file.ext.<env>" to "file.ext" when compiling for a specific environment.

Designed to be used in npm run/build/test scripts.

Usage:

env-cmd-extra -e <env> [-i <exclude folder>] <script>

eg. Build for devtest environment, ignoring the node_modules folder.

env-cmd-extra -e devtest -i node_modules build

This will use .env.devtest as the default .env file, in addition to renaming any other files it finds of the form <file>.<ext>.devtest to <file>.<ext> befaore then running the specified 'build' script.