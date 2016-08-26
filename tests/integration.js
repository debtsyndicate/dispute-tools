/* globals logger */

const glob = require('glob');
const Mocha = require('mocha');
const path = require('path');

const mocha = new Mocha();

mocha.setup({ timeout: 10000 });
mocha.reporter('spec');

require(path.join(process.cwd(), '/bin/server.js'));

glob.sync('tests/integration/**/*.js')
  .filter((filePath) => {
    const fileName = path.parse(filePath).base;

    return (fileName.indexOf(process.argv[2]) !== -1);
  })
  .forEach((file) => {
    mocha.addFile(path.join(process.cwd(), file));
  });

// run Mocha
mocha.run((failures) => {
  process.on('exit', () => {
    process.exit(failures);
  });
  process.exit();
});


process.on('error', (err) => {
  logger.error(err, err.stack);
  process.exit(1);
});
