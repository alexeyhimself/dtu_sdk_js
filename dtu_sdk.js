//const excluded_events = "mousedown mouseup mousemove mouseover mouseout mousewheel";
//const events = "click focus blur keydown change dblclick keydown keyup keypress textInput touchstart touchmove touchend touchcancel resize scroll zoom select change submit reset".split(" ");

let REAL_OPERATION = true;
if (['--', 'dotheyuse.com'].includes(window.location.hostname))
  REAL_OPERATION = false;

async function DTU_RX_API_submint_report(report, api_url) { // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  report['element_path'] = String(report['element_path']); // for passing through application/x-www-form-urlencoded which is used instead of application/json due to no-cors header
  //console.warn('Fix values multiselect')
  if (report['value']) {
    let val = report['value'][0].replaceAll('\'', '"');
    //console.warn('Fix values parsing')
    if (val[0] == '[')
      val = JSON.parse(val);
    report['value'] = String(val);  
  }
  report['ugids'] = String(report['ugids']);
  //console.log(report)
  const response = await fetch(api_url + '/api/submit', { // default options are marked with *
    method: "POST",
    mode: "no-cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "include", // include, *same-origin, omit
    headers: {
      //"Content-Type": "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(report), // body data type must match "Content-Type" header
  });
  //return response.json(); // parses JSON response into native JavaScript objects // causes u_sdk.js?v=11:29 Uncaught (in promise) SyntaxError: Unexpected end of input (at d.. due to no-cors
}

const DEFAULT_CTAG = 'DEMO MVP';
const DEFAULT_TOPIC = 'default';
const DEFAULT_DTU_DATASET_ATTRIBUTE = "dtu";
const DEFAULT_API_URL = 'http://localhost';
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
        'textarea': ['change'],
        '': ['click'], // anchor
        undefined: ['click'], // spans, divs, etc.
      };
const LISTEN_TO_DEFAULT_EVENTS = true;
const SUPPORTED_ELEMENT_TAGS = ['A', 'BUTTON', 'INPUT'];

let DEFAULT_CALLBACK = console.log;
let DEFAULT_UID = 'you@example.com';

if (REAL_OPERATION) {
  DEFAULT_CALLBACK = DTU_RX_API_submint_report;
  const uid_ms = Date.now(new Date()); // timestamp as unique UID
  const uid_s = Math.floor(uid_ms / 1000); // UID in seconds to make it shorter
  DEFAULT_UID = uid_s;
}
else {
  if (typeof DTU_RX_API_submint_report_simulation !== 'undefined')
    DEFAULT_CALLBACK = DTU_RX_API_submint_report_simulation;
  else
    console.warn("DTU_RX_API_submint_report_simulation is undefined. Setting 'console.log' as DEFAULT_CALLBACK");
}

const DEFAULT_PROBLEM_DESCRIPTION = '';
const STATUS_NOT_READY = 'Not ready. See problem description above';
const STATUS_READY = 'Ready';
const DEFAULT_UGIDS = ['Visitor'];


class DoTheyUse {
  constructor(config) {
    this.status = STATUS_NOT_READY;
    this.problem_description = DEFAULT_PROBLEM_DESCRIPTION;
    this.supported_input_types_and_events = SUPPORTED_INPUT_TYPES_AND_EVENTS;

    if (!this.config_is_valid(config)) {
      console.error(this.problem_description);
      return;
    }

    this.ctag = config.ctag || DEFAULT_CTAG;
    this.topic = config.topic || DEFAULT_TOPIC;
    this.dtu_attribute = config.dtu_attribute || DEFAULT_DTU_DATASET_ATTRIBUTE;
    this.api_url = config.api_url || DEFAULT_API_URL;
    this.callback = config.callback || DEFAULT_CALLBACK;
    this.uid = this.get_synthetic_uid();
    this.ugids = this.get_synthetic_ugids();

    if ([true, false].includes(config.listen))
      this.listen_default_events = config.listen;
    else
      this.listen_default_events = LISTEN_TO_DEFAULT_EVENTS;

    if (this.listen_default_events)
      this.listen();

    this.status = STATUS_READY;
  }

  set_uid(uid) {
    this.uid = uid;
    localStorage.removeItem('synthetic_uid');
  }

  set_ugids(ugids) {
    this.ugids = ugids;
    localStorage.removeItem('synthetic_ugids');
  }

  get_uid() {
    return this.uid;
  }

  get_ugids() {
    return this.ugids;
  }

  create_synthetic_uid() {
    localStorage.setItem('synthetic_uid', DEFAULT_UID); 
    return DEFAULT_UID;
  }

  create_synthetic_ugids() {
    localStorage.setItem('synthetic_ugids', JSON.stringify(DEFAULT_UGIDS)); 
    return DEFAULT_UGIDS;
  }

  get_synthetic_uid() {
    const uid = localStorage.getItem('synthetic_uid');
    if (uid)
      return uid;

    return this.create_synthetic_uid();
  }

  get_synthetic_ugids() {
    const ugids = localStorage.getItem('synthetic_ugids');
    if (ugids)
      return JSON.parse(ugids);

    return this.create_synthetic_ugids();
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
    else {
      return true;
    }
  }

  init_report() {
    this.report = {};
    this.report.ctag = this.ctag;
    this.report.topic = this.topic;
    this.report.uid = this.uid;
    this.report.ugids = this.ugids;
  }

  enrich_report(r) {
    if (typeof r === "object") {
      for (const [key, value] of Object.entries(r))
        this.report[key] = value
    }

    this.report.date_time = Date.now();

    this.report.url_scheme = window.location.protocol;
    this.report.url_domain_name = window.location.hostname;
    this.report.url_port = window.location.port;
    this.report.url_path = window.location.pathname;
    this.report.url_parameters = window.location.search;

    //this.report.page_title = document.title;
  }

  make_report(r) {
    this.init_report();
    this.enrich_report(r);
  }

  send_report_to_dtu_api() {
    return this.callback(this.report, this.api_url);
  }

  send_report(r) {
    this.make_report(r);
    return this.send_report_to_dtu_api();
  }

  collect_dtu_elements() {
    const elements_with_data_dtu = document.querySelectorAll('[data-' + this.dtu_attribute + ']') || [];
    let elements_to_listen_to = [];
    for (let i = 0; i < elements_with_data_dtu.length; i++) {
      let element = elements_with_data_dtu[i];
      if (SUPPORTED_INPUT_TYPES_AND_EVENTS[element.type]) {
        if (!this.has_dtu_children(element))
          elements_to_listen_to.push(element);
      }
      else {
        if (!this.has_dtu_children(element)) {
          console.error("Unsupported element tagged with data-dtu attribute:\n", element, "\n", "element type:", element.type, "\n", "data-dtu value:", element.dataset.dtu);
          element.parentElement.parentElement.classList.add("unsupported"); // for story book highlight and for auto test
        }
      }
    }
    return elements_to_listen_to;
  }

  has_dtu_children(element) {
    if (element.hasChildNodes()) {
      let em = [];
      try {
        em = element.childNodes();
      }
      catch (error) { // TypeError childNodes is not a function for some elements like ul, ol, a, button, etc.
        em = element.childNodes;
      }
      
      for (let i = 0; i < em.length; i++) {
        let el = em[i];
        try {
          if (![undefined, null].includes(el.getAttribute('data-dtu')))
            return true;
          if (this.has_dtu_children(el))
            return true;
        }
        catch {}; // no getAttribute for some nodes (and they are not parents/children as well), so skip them
      }
    }

    return false;
  }

  get_element_path(element) {
    let parents = [];
    // element = element.parentNode; // do not include this element in the path
    for ( ; element && element !== document; element = element.parentNode ) { // https://gomakethings.com/how-to-get-all-parent-elements-with-vanilla-javascript/#1-get-all-parents
      let element_data_dtu = element.getAttribute('data-dtu');
      if (element_data_dtu !== null) {
        if (element_data_dtu != '')
          parents.push(element_data_dtu);
        else {
          if (['A', 'BUTTON'].includes(element.tagName)) {
            parents.push(element.innerText);
          }
          else
            console.error('Invalid data-dtu value for the element: ', element);
        }
      }
    }
    return parents.reverse();
  }

  process_element_event(element, event_type) {
    let r = {};
    const el = element.dataset[DEFAULT_DTU_DATASET_ATTRIBUTE];
    if (el)
      r.element = el;
    else {
      if (['A', 'BUTTON'].includes(element.tagName)) {
        r.element = element.innerText;
      }
    }

    r['element_path'] = this.get_element_path(element);

    r.element_type = element.type;
    r.event_type = event_type;

    let val;
    if ('A' == element.tagName) {
      val = element.innerText;
      r.element_type = 'anchor'; // as type = '' for this element type
    } 
    else if ('BUTTON' == element.tagName) {
      val = element.innerText;
      r.element_type = 'button'; // as type = '' for this element type
    }
    else if (['UL', 'OL'].includes(element.tagName)) {
      r.element_type = 'list'; // as type = '' for this element type
    }
    else
      val = element.value;

    r.value = val;

    if (['checkbox', 'radio'].includes(element.type))
      r['checked'] = element.checked;

    if (['password', 'text', 'textarea'].includes(element.type))
      r.value = val.length; // send number of symbols rather than content

    if ('file' == element.type) {
      const files = [];
      for (var i = 0; i < element.files.length; i++) {
        let file_name = element.files[i].name;
        files.push(file_name);
      }
      r.value = files; // send file name(s) rather than files
    }

    if (['select-one', 'select-multiple'].includes(element.type)) {
      const options = element.selectedOptions; // https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box
      const values = Array.from(options).map(({ value }) => value);
      r.value = values;
    }

    return r;
  }

  /*
  get_nested_inner_text(node, accumulator) { // https://stackoverflow.com/questions/67134998/javascript-recursion-to-get-innertext
    if (!accumulator)
      accumulator = [];

    if (node.nodeType === 3) {// 3 == text node
      let node_text = node.nodeValue.trim();
      if (node_text != '') {
        accumulator.push(node_text);
      }
    }
    else
      for (let child of node.childNodes)
        this.get_nested_inner_text(child, accumulator)

    let return_value = {'inner_text': accumulator};
    if (node.tagName == 'A')
      return_value['href'] = node.href;
    if (accumulator.length == 0)
      return_value['status'] = 'no_text'
    if (node.dataset)
      if (node.dataset['dtuSkip'] !== undefined)
        return_value['status'] = 'skip';
    if (!return_value['status'])
      return_value['status'] = 'ok';

    return return_value;
  }

  d() {
    for (let i = 0; i < SUPPORTED_ELEMENT_TAGS.length; i++) {
      let tag = SUPPORTED_ELEMENT_TAGS[i];
      let found_tags = document.querySelectorAll(tag);
      for (let j = 0; j < found_tags.length; j++) {
        let each_tag = found_tags[j];
        let inner_text = this.get_nested_inner_text(each_tag)
        console.log(inner_text)
      }
    }
  }
  */

  describe() {
    for (let i = 0; i < this.elements_to_listen_to.length; i++) {
      let element = this.elements_to_listen_to[i];
      let event = this.supported_input_types_and_events[element.type][0];
      let r = this.process_element_event(element, event);
      this.make_report(r);

      if (i == 0) { // only for the first element
        console.log('On this page I see the following DTU configuration: ')
        console.log('---------------------------------------------------')
        console.log('ctag:', this.report.ctag);
        console.log('topic:', this.report.topic);
        console.log('uid:', this.report.uid);
        let url = this.report.url_scheme 
          + '//' 
          + this.report.url_domain_name 
          // + this.report.url_port
          + this.report.url_path;
          // + this.report.url_parameters

        console.log('page url:', url);
        console.log('page title:', this.report.page_title);
        console.log('callback:', this.callback);
        if (REAL_OPERATION)
          console.log('API url:', this.api_url);
        console.log('');
      }

      console.log('element path:', this.report.element_path.join(' > '));
      console.log('element type:', this.report.element_type);
      console.log('event type:', this.report.event_type);
      console.log('current value(s):', this.report.value);

      console.log('')
    }
    console.log('Totally:', this.elements_to_listen_to.length, 'element(s)');
  }

  listen() {
    const dtu_this = this;
    dtu_this.elements_to_listen_to = dtu_this.collect_dtu_elements();
    for (let i = 0; i < dtu_this.elements_to_listen_to.length; i++) {
      const element = dtu_this.elements_to_listen_to[i];
      try {
        const events_to_listen = dtu_this.supported_input_types_and_events[element.type];
        for (let j = 0; j < events_to_listen.length; j++) {
          // Prevention of adding listener to an element which is already being listened:
          // https://stackoverflow.com/questions/11455515/how-to-check-whether-dynamically-attached-event-listener-exists-or-not
          if (element.getAttribute("dtu-listened"))
            continue;

          element.addEventListener(events_to_listen[j], function (e) {
            const event_this = e; // to distinguish event.this and dtu.this
            let r = dtu_this.process_element_event(element, event_this.type);
            dtu_this.send_report(r);
          }, false);

          // When dtu.listen() is called in order not to listen again already listened elements
          // and due to no standard in-browser way of knowing if element has any listeners:
          // https://stackoverflow.com/questions/11455515/how-to-check-whether-dynamically-attached-event-listener-exists-or-not
          // we add attribute which will allow prevention of listening again:
          element.setAttribute("dtu-listened", true);
        }  
      }
      catch (error) {
        console.error("Unsupported element:\n", element, "\n", "element type: ", element.type, error);
        element.parentElement.parentElement.className = 'unsupported'; // for story book highlight and for auto test
      }
    }
  }
}

function dotheyuse(config) {
  const dtu = new DoTheyUse(config);

  // Due to DOM changes and adding/removing elements we need to track DOM mutations
  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  // and add new listeners if it's needed
  const cfg = { attributes: false, childList: true, subtree: true };
  const observer = new MutationObserver(() => { dtu.listen(); });
  observer.observe(document, cfg);

  return dtu;
}

try { // for jest unit tests
  exports.dotheyuse = dotheyuse; 
  exports.SUPPORTED_INPUT_TYPES_AND_EVENTS = SUPPORTED_INPUT_TYPES_AND_EVENTS;
}
catch (error) {} // to avoid an error "Uncaught ReferenceError: exports is not defined" in browser's dev console
