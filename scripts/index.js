const program = require('commander');

require('./verify-bytecode').cmd(program);

program.parse(process.argv);
