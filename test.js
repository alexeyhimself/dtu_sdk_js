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

test('SDK replies with status "Ready" if config does not contain "ctag"', () => {
  let config = {...minimum_valid_config};
  delete config.ctag;
  const dtu = imports.dotheyuse(config);
  expect(dtu.status).toMatch(/Ready/);
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

/*
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

// looks like not relevant anymore with allowed no ctag
test('SDK does not listen if it has status "Not ready"', () => {
  const dtu = imports.dotheyuse({'callback': 'not_exists'});
  expect(dtu.status).toMatch(/Not ready/);
  expect(dtu.listen_default_events).toBeFalsy();
});
*/

// form report
const SUPPORTED_INPUT_TYPES_AND_EVENTS = imports.SUPPORTED_INPUT_TYPES_AND_EVENTS;
const types_all = Object.keys(SUPPORTED_INPUT_TYPES_AND_EVENTS);
const types_secret_or_long = ['password', 'text', 'textarea'];
const types_files = ['file'];
const types_select = ['select-one', 'select-multiple'];
const types_undefined = [undefined];
const types_to_exclude = types_secret_or_long.concat(types_files).concat(types_select).concat(types_undefined);

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

  let event = {'type': SUPPORTED_INPUT_TYPES_AND_EVENTS[type][0]};

  let element = {'type': type, 'parentNode': document};
  element['dataset'] = {};
  const element_name = 'some ' + type;
  element['dataset'][dtu.dtu_attribute] = element_name;
  const element_value = 'unit test val';
  element['value'] = element_value;
  element.getAttribute = function (argument) {};
  let report = dtu.process_element_event(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual(element_value);
});

test.each(types_secret_or_long)('SDK .form_report() method forms report for type: %s', (type) => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  let event = {'type': SUPPORTED_INPUT_TYPES_AND_EVENTS[type][0]};

  let element = {'type': type};
  element['dataset'] = {};
  const element_name = 'some ' + type;
  element['dataset'][dtu.dtu_attribute] = element_name;
  const element_value = 'unit test val';
  element['value'] = element_value;
  element.getAttribute = function (argument) {};
  let report = dtu.process_element_event(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual(element_value.length);
});

test.each(types_files)('SDK .form_report() method forms report for type: %s', (type) => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  let event = {'type': SUPPORTED_INPUT_TYPES_AND_EVENTS[type][0]};

  let element = {'type': type, 'files': [{'name': 1}, {'name': 2}]};
  element['dataset'] = {};
  const element_name = 'some ' + type;
  element['dataset'][dtu.dtu_attribute] = element_name;
  element.getAttribute = function (argument) {};
  let report = dtu.process_element_event(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual([1, 2]);
});

test('SDK .form_report() method forms report for type: select-one', () => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  const type = 'select-one';
  let event = {'type': SUPPORTED_INPUT_TYPES_AND_EVENTS[type][0]};

  let element = {'type': type, 'selectedOptions': [{'value': 1}]};
  element['dataset'] = {};
  const element_name = 'some ' + type;
  element['dataset'][dtu.dtu_attribute] = element_name;
  element.getAttribute = function (argument) {};
  let report = dtu.process_element_event(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual([1]);
});

test('SDK .form_report() method forms report for type: select-multiple', () => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  const type = 'select-multiple';
  let event = {'type': SUPPORTED_INPUT_TYPES_AND_EVENTS[type][0]};
  
  let element = {'type': type, 'selectedOptions': [{'value': 1}, {'value': 2}]};
  element['dataset'] = {};
  const element_name = 'some ' + type;
  element['dataset'][dtu.dtu_attribute] = element_name;
  element.getAttribute = function (argument) {};
  let report = dtu.process_element_event(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual([1, 2]);
});


test.each(['A', 'BUTTON'])('SDK .form_report() method forms value of innerText for tagName: %s', (tag) => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);

  let type = ''; // 'A' has '', 'BUTTON' has 'submit'
  let event = {'type': SUPPORTED_INPUT_TYPES_AND_EVENTS[type][0]};

  let element = {'type': type, 'tagName': tag};
  element['dataset'] = {};
  const element_name = 'some ' + tag;
  element['dataset'][dtu.dtu_attribute] = element_name;
  const element_value = 'unit test val';
  element['innerText'] = element_value;
  element.getAttribute = function (argument) {};
  let report = dtu.process_element_event(element, event);

  expect(report.element).toEqual(element_name);
  expect(report.value).toEqual(element_value);
});

test('SDK .listen() method throws an error if unsupported element type', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  let element = {'type': 'unit test unsupported type', 'parentElement': {'parentElement': {'className': undefined}}};
  dtu.collect_all_elements = function () {return [element]};
  dtu.listen();
  expect(element.parentElement.parentElement.className).toEqual('unsupported');
});


//// send
test('SDK .send() method sends "ctag" in report', () => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);
  let report = dtu.send_report();
  expect(report.ctag).toEqual(minimum_valid_report.ctag);
});

test('SDK .send("element", "value") method sends "element" and "value" in report', () => {
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);
  const el = 'some element';
  const val = 'some value';
  let report = dtu.send_report({'element': el, 'value': val});
  expect(report.element).toEqual(el);
  expect(report.value).toEqual(val);
});

test('SDK .send() method sends "ctag" in report', () => {
  const element = document.createElement('div');
  let config = {...minimum_valid_config};
  config.callback = mock_send;
  const dtu = imports.dotheyuse(config);
  let report = dtu.send_report();
  expect(report.ctag).toEqual(minimum_valid_report.ctag);
});

//// describe
test('SDK .describe() method works', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  const type = 'text';
  let element = {'type': type};
  element['dataset'] = {};
  const element_name = 'some ' + type;
  element['dataset'][dtu.dtu_attribute] = element_name;
  element['value'] = 'some text';
  element.getAttribute = function (argument) {};
  dtu.elements_to_listen_to = [element];  
  dtu.describe();
});

//// set, get
test('SDK .get_uid() method gets uid', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  expect(dtu.uid).toEqual(dtu.get_uid());
});

test('SDK .set_uid() method sets uid', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  dtu.set_uid('test_uid');
  expect(dtu.uid).toEqual(dtu.get_uid());
});

test('SDK .get_ugids() method gets ugids', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  expect(dtu.ugids).toEqual(dtu.get_ugids());
});

test('SDK .set_ugids() method sets ugids', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  dtu.set_ugids('test_ugids');
  expect(dtu.ugids).toEqual(dtu.get_ugids());
});

test('SDK .get_mode() method gets mode', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  expect(dtu.mode).toEqual(dtu.get_mode());
});

test('SDK .set_mode() method gets mode', () => {
  let config = {...minimum_valid_config};
  const dtu = imports.dotheyuse(config);
  dtu.set_mode('test')
  expect(dtu.mode).toEqual(dtu.get_mode());
});
