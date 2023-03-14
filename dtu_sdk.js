//const excluded_events = "mousedown mouseup mousemove mouseover mouseout mousewheel";
//const events = "click focus blur keydown change dblclick keydown keyup keypress textInput touchstart touchmove touchend touchcancel resize scroll zoom select change submit reset".split(" ");

const DEFAULT_TOPIC = 'default';
const DEFAULT_DTU_DATASET_ATTRIBUTE = "dtu";
const SUPPORTED_INPUT_TYPES_AND_EVENTS = {
        'select-one': ['change'],
        'select-multiple': ['change'],
        'datetime-local': ['change'],
        'date': ['change'],
        'time': ['change'],
        'checkbox': ['change'],
        'radio': ['change'],
        'email': ['change'],
        'password': ['change'],
        'number': ['change'],
        'range': ['change'],
        'file': ['change'],
        'text': ['change'],
        'button': ['click'],
        'submit': ['click'],
        '': ['click'], // link button in bootstrap 5 at least
        undefined: ['click'],
      };
const LISTEN_TO_DEFAULT_EVENTS = true;
const DEFAULT_CALLBACK = console.log;
const DEFAULT_PROBLEM_DESCRIPTION = '';
const STATUS_NOT_READY = 'Not ready. See problem description above';
const STATUS_READY = 'Ready';


class DoTheyUse {
  constructor(config) {
    this.status = STATUS_NOT_READY;
    this.problem_description = DEFAULT_PROBLEM_DESCRIPTION;
    this.supported_input_types_and_events = SUPPORTED_INPUT_TYPES_AND_EVENTS;

    if (!this.config_is_valid(config)) {
      console.error(this.problem_description);
      return;
    }

    this.ctag = config.ctag;
    this.topic = config.topic || DEFAULT_TOPIC;
    this.dtu_attribute = config.dtu_attribute || DEFAULT_DTU_DATASET_ATTRIBUTE;
    this.callback = config.callback || DEFAULT_CALLBACK;
    this.collect_dtu_elements();

    if ([true, false].includes(config.listen))
      this.listen_default_events = config.listen;
    else
      this.listen_default_events = LISTEN_TO_DEFAULT_EVENTS;

    if (this.listen_default_events)
      this.listen();

    this.status = STATUS_READY;
  }

  config_is_valid(config) {
    if (!config) {
      this.problem_description = "dotheyuse not working: config was not provided durinig initialization. ";
      return false;
    }
    else if (config.constructor !== Object) {
      this.problem_description = "dotheyuse not working: config must be a dictionary, but given a: " + typeof(config);
      return false;
    }
    else if (!config.ctag) {
      this.problem_description = "dotheyuse not working: config must contain 'ctag'. ";
      return false;
    }
    else {
      return true;
    }
  }

  init_report() {
    this.report = {};
    this.report.ctag = this.ctag;
    this.report.topic = this.topic;
  }

  enrich_report(r) {
    if (typeof r === "object") {
      for (const [key, value] of Object.entries(r))
        this.report[key] = value

      this.report.element_path = ['', r.element];
    }

    this.report.date_time = Date.now();
  }

  make_report(r) {
    this.init_report();
    this.enrich_report(r);
  }

  send_report_to_dtu_api() {
    // const json_report = JSON.stringify(this.report); // stringify before sending as payload
    const json_report = this.report; // till no real networking - no stringify as well to save CPU time
    return this.callback(json_report);
  }

  send(r) {
    this.make_report(r);
    return this.send_report_to_dtu_api();
  }

  collect_dtu_elements() {
    this.elements_to_listen_to = document.querySelectorAll('[data-' + this.dtu_attribute + ']');
  }

  form_report(element, event_this) {
    const el = event_this.dataset[DEFAULT_DTU_DATASET_ATTRIBUTE];
    let r = {'element': el};

    let val = undefined;
    if (['A', 'BUTTON'].includes(element.tagName))
      val = element.innerText;
    else
      val = event_this.value;

    r.value = val;

    if (['checkbox', 'radio'].includes(element.type))
      r['checked'] = element.checked;

    if (['password', 'text'].includes(element.type))
      r.value = val.length;

    if ('file' == element.type) {
      const files = [];
      for (var i = 0; i < element.files.length; i++) {
        let file_name = element.files[i].name;
        files.push(file_name);
      }
      r.value = files;
    }

    if (['select-one', 'select-multiple'].includes(element.type)) {
      const options = element.selectedOptions; // https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box
      const values = Array.from(options).map(({ value }) => value);
      r.value = values;
    }

    return r;
  }

  listen() {
    const dtu_this = this;
    for (let i = 0; i < dtu_this.elements_to_listen_to.length; i++) {
      const element = dtu_this.elements_to_listen_to[i];
      try {
        const events_to_listen = dtu_this.supported_input_types_and_events[element.type];
        for (let j = 0; j < events_to_listen.length; j++) {
          element.addEventListener(events_to_listen[j], function (e) {
            const event_this = this; // to distinguish event.this and dtu.this
            let r = dtu_this.form_report(element, event_this);
            dtu_this.send(r);
          }, false);
        }
      }
      catch (error) {
        console.error("Unsupported element:\n", element, "\n", "element type: ", element.type, error);
        element.parentElement.parentElement.className = 'unsupported';
      }
    }
  }
}

function dotheyuse(config) {
  return new DoTheyUse(config);
}

try { // for jest unit tests
  exports.dotheyuse = dotheyuse; 
  exports.SUPPORTED_INPUT_TYPES_AND_EVENTS = SUPPORTED_INPUT_TYPES_AND_EVENTS;
}
catch (error) {} // to avoid an error "Uncaught ReferenceError: exports is not defined" in browser's dev console
