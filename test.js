/**
 * @jest-environment jsdom  // https://jestjs.io/docs/configuration#testenvironment-string
 */ 

const imports = require('./dtu_sdk.js');

let minimum_valid_config = {'ctag': 'unit test'};
const minimum_valid_report = {...minimum_valid_config};

function mock_send(report) {
  return report;
}


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


// form report
const SUPPORTED_INPUT_TYPES_AND_EVENTS = imports.SUPPORTED_INPUT_TYPES_AND_EVENTS;
const types_all = Object.keys(SUPPORTED_INPUT_TYPES_AND_EVENTS);
const types_secret_or_long = ['password', 'text'];
const types_files = ['file'];
const types_to_exclude = types_secret_or_long.concat(types_files);

let types_normal = [...types_all]; // types_normal = types_all - types_to_exclude
for (let i in types_to_exclude) {
  const index = types_normal.indexOf(types_to_exclude[i]);
  if (index > -1)
    types_normal.splice(index, 1);
}

test.each(types_normal)('SDK .form_report() method works for type: %s', (type) => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  let event = {};
  event['dataset'] = {};
  const element_name = 'some ' + type;
  event['dataset'][dtu.dtu_attribute] = element_name;
  const element_value = 'unit test val';
  event['value'] = element_value;

  let element = {'type': type};
  let report = dtu.form_report(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual(element_value);
});

test.each(types_secret_or_long)('SDK .form_report() method forms report for type: %s', (type) => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  let event = {};
  event['dataset'] = {};
  const element_name = 'some ' + type;
  event['dataset'][dtu.dtu_attribute] = element_name;
  const element_value = 'unit test val';
  event['value'] = element_value;

  let element = {'type': type};
  let report = dtu.form_report(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual(element_value.length);
});

test.each(types_files)('SDK .form_report() method forms report for type: %s', (type) => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  let event = {};
  event['dataset'] = {};
  const element_name = 'some ' + type;
  event['dataset'][dtu.dtu_attribute] = element_name;

  let element = {'type': type, 'files': [{'name': 1}, {'name': 2}]};
  let report = dtu.form_report(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual([1, 2]);
});

test.each(['A', 'BUTTON'])('SDK .form_report() method forms value of innerText for tagName: %s', (tag) => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  let event = {};
  event['dataset'] = {};
  const element_name = 'some ' + tag;
  event['dataset'][dtu.dtu_attribute] = element_name;
  const element_value = 'unit test val';

  let element = {'type': undefined, 'tagName': tag, 'innerText': element_value};
  let report = dtu.form_report(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual(element_value);
});

test('SDK .listen() method throws an error if unsupported element type', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  let element = {'type': 'unit test unsupported type', 'parentElement': {'parentElement': {'className': undefined}}};
  dtu.elements_to_listen_to = [element];
  dtu.listen();
  expect(element.parentElement.parentElement.className).toEqual('unsupported');
});


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
  let report = dtu.send({'element': el, 'value': val});
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
