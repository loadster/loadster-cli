const Args = require('command-line-args')
const Options = Args([
    {
        name: 'version',
        alias: 'v',
        type: Boolean
    }
])

if (Options.version) {
    console.log('1.0.0')
}

console.log('This is the Loadster CLI!')
