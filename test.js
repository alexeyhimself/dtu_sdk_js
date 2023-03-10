/**
 * @jest-environment jsdom  // https://jestjs.io/docs/configuration#testenvironment-string
 */ 

const imports = require('./dtu_sdk.js');

let minimum_valid_config = {'ctag': 'unit test'};
const minimum_valid_report = {...minimum_valid_config};


// Minimal configuration tests
test('SDK replies with status "Not ready" if config is not specified', () => {
  const dtu = imports.dotheyuse();
  expect(dtu.problem_description).toMatch(/dotheyuse not working: config was not provided durinig initialization/);
  expect(dtu.status).toMatch(/Not ready/);
});

test('SDK replies with status "Not ready" if config is not a dictionary', () => {
  let config = [];
  const dtu = imports.dotheyuse(config);
  expect(dtu.problem_description).toMatch(/dotheyuse not working: config must be a dictionary/);
  expect(dtu.status).toMatch(/Not ready/);
});

test('SDK replies with status "Not ready" if config does not contain "ctag"', () => {
  let config = {...minimum_valid_config};
  delete config.ctag;
  const dtu = imports.dotheyuse(config);
  expect(dtu.problem_description).toMatch(/dotheyuse not working: config must contain 'ctag'/);
  expect(dtu.status).toMatch(/Not ready/);
});

test('SDK replies with status "Ready" if config has valid "ctag"', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  expect(dtu.problem_description).toEqual('');
  expect(dtu.status).toMatch(/Ready/);
});


// Extra configurations tests
//// listen
test('SDK does not listen if config has "listen": false', () => {
  let config = {...minimum_valid_config};
  config.listen = false;
  const dtu = imports.dotheyuse(config);
  expect(dtu.listen_default_events).toBeFalsy();
});

test('SDK listens if config has "listen": true', () => {
  let config = {...minimum_valid_config};
  config.listen = true;
  const dtu = imports.dotheyuse(config);
  expect(dtu.listen_default_events).toBeTruthy();
});

test('SDK listens if config has no "listen" option', () => {
  let config = {...minimum_valid_config};
  delete config.listen;
  const dtu = imports.dotheyuse(config);
  expect(dtu.listen_default_events).toBeTruthy();
});

test('SDK does not listen if it has status "Not ready"', () => {
  const dtu = imports.dotheyuse({'missing': 'ctag'});
  expect(dtu.status).toMatch(/Not ready/);
  expect(dtu.listen_default_events).toBeFalsy();
});


function mock_send(report) {
  return report;
}

//// send
test('SDK .send() method sends "ctag" in report', () => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);
  let report = dtu.send();
  expect(report.ctag).toEqual(minimum_valid_report.ctag);
});

test('SDK .send("element", "value") method sends "element" and "value" in report', () => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);
  const el = 'some element';
  const val = 'some value';
  let report = dtu.send(el, val);
  expect(report.element).toEqual(el);
  expect(report.value).toEqual(val);
});

test('SDK .send() method sends "ctag" in report', () => {
  const element = document.createElement('div');
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);
  let report = dtu.send();
  expect(report.ctag).toEqual(minimum_valid_report.ctag);
});
