const imports = require('./dtu_sdk.js');

test('status "Not ready" if config is not specified', () => {
  let dtu = imports.dotheyuse();
  expect(dtu.status).toMatch(/^Not ready\. /);
});
