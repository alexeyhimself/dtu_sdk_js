//const excluded_events = "mousedown mouseup mousemove mouseover mouseout mousewheel";
//const events = "click focus blur keydown change dblclick keydown keyup keypress textInput touchstart touchmove touchend touchcancel resize scroll zoom select change submit reset".split(" ");

const DEFAULT_TOPIC = 'default';
const DEFAULT_DTU_DATASET_ATTRIBUTE = "dtu";
const DEFAULT_ELEMENTS_EVENTS = {
        'select-one': ['change'],
        'datetime-local': ['change'],
        'button': ['click'],
        '': ['click'], // link button in bootstrap 5 at least
        undefined: ['click'],
      };
const DEFAULT_LISTEN_TO_DEFAULT_EVENTS = true;
const DEFAULT_CALLBACK = DTU_RX_API_submint_report_endpoint;


class DoTheyUse {
  constructor(config) {
    if (!this.config_is_valid(config))
      return;

    this.ctag = config.ctag;
    this.topic = config.topic || DEFAULT_TOPIC;
    this.dtu_attribute = config.dtu_attribute || DEFAULT_DTU_DATASET_ATTRIBUTE;
    this.callback = config.callback || DEFAULT_CALLBACK;
    this.collect_dtu_elements();

    if ([true, false].includes(config.listen))
      this.listen_default_events = config.listen;
    else
      this.listen_default_events = DEFAULT_LISTEN_TO_DEFAULT_EVENTS;

    if (this.listen_default_events)
      this.listen();
  }

  config_is_valid(config) {
    if (!config) {
      console.error("dotheyuse not working: config was not provided durinig initialization. ");
      return false;
    }
    else if (config.constructor !== Object) {
      console.error("dotheyuse not working: config must be a dictionary, but given a: ", typeof(config));
      return false;
    }
    else if (!config.ctag) {
      console.error("dotheyuse not working: config must contain 'ctag'. ");
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

  enrich_report(element, value) {
    this.report.feature = element;
    this.report.feature_path = ['', element];
    this.report.value = value;
    this.report.date_time = Date.now();
  }

  make_report(element, value) {
    this.init_report();
    this.enrich_report(element, value);
  }

  send_report_to_dtu_api() {
    // const json_report = JSON.stringify(this.report); // stringify before sending as payload
    const json_report = this.report; // till no real networking - no stringify as well to save CPU time
    this.callback(json_report);
  }

  send(element, value) {
    this.make_report(element, value);
    this.send_report_to_dtu_api();
  }

  collect_dtu_elements() {
    this.elements_to_listen_to = document.querySelectorAll('[data-' + this.dtu_attribute + ']');
  }

  listen() {
    for (let i = 0; i < this.elements_to_listen_to.length; i++) {
      const element = this.elements_to_listen_to[i];
      const events_to_listen = DEFAULT_ELEMENTS_EVENTS[element.type];
      const dtu_this = this;
      for (let j = 0; j < events_to_listen.length; j++) {
        try {
          element.addEventListener(events_to_listen[j], function (e) {
            const event_this = this; // to distinguish event.this and dtu.this
            const el = event_this.dataset[DEFAULT_DTU_DATASET_ATTRIBUTE];
            const val = event_this.value;
            dtu_this.send(el, val);
          }, false);
        }
        catch (error) {
          console.error("DoTheyUse can't bind listener to an element: ", element, " due to an error: ", error);
        }
      }
    }
  }
}

function dotheyuse(config) {
  return new DoTheyUse(config);
}
