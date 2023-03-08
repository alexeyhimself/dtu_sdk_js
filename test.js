/**
 * @jest-environment jsdom  // https://jestjs.io/docs/configuration#testenvironment-string
 */ 

const imports = require('./dtu_sdk.js');

test('SDK replies with status "Not ready" if config is not specified', () => {
  let dtu = imports.dotheyuse();
  expect(dtu.problem_description).toMatch(/dotheyuse not working: config was not provided durinig initialization/);
  expect(dtu.status).toMatch(/Not ready. See problem description above/);
});

test('SDK replies with status "Not ready" if config is not a dictionary', () => {
  let dtu = imports.dotheyuse([]);
  expect(dtu.problem_description).toMatch(/dotheyuse not working: config must be a dictionary/);
  expect(dtu.status).toMatch(/Not ready. See problem description above/);
});

test('SDK replies with status "Not ready" if config is not a dictionary', () => {
  let dtu = imports.dotheyuse({'missing': 'ctag'});
  expect(dtu.problem_description).toMatch(/dotheyuse not working: config must contain 'ctag'/);
  expect(dtu.status).toMatch(/Not ready. See problem description above/);
});

let valid_config = {'ctag': 'unit test'};

test('SDK replies with status "Ready" if config has "ctag"', () => {
  let dtu = imports.dotheyuse(valid_config);
  expect(dtu.problem_description).toEqual('');
  expect(dtu.status).toMatch(/Ready/);
});

test('SDK does not listen if config has "listen": false', () => {
  let dtu = imports.dotheyuse({'ctag': 'unit test', 'listen': false});
  expect(dtu.problem_description).toEqual('');
  expect(dtu.status).toMatch(/Ready/);
  expect(dtu.listen_default_events).toBeFalsy();
});
