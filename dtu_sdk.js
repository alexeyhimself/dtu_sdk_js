//const excluded_events = "mousedown mouseup mousemove mouseover mouseout mousewheel";
//const events = "click focus blur keydown change dblclick keydown keyup keypress textInput touchstart touchmove touchend touchcancel resize scroll zoom select change submit reset".split(" ");

const REAL_BACKEND_OPERATION = true; // default is true

async function DTU_RX_API_submint_report(report, api_url) { // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  report['element_path'] = String(report['element_path']); // for passing through application/x-www-form-urlencoded which is used instead of application/json due to no-cors header
  report['ugids'] = String(report['ugids']);
  report['value'] = btoa(String(report['value']));
  report['page_title'] = btoa(String(report['page_title']));

  const response = await fetch(api_url + '/api/submit', { // default options are marked with *
    method: "POST",
    mode: "no-cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "include", // include, *same-origin, omit
    headers: {
      //"Content-Type": "application/json", // json is not allowed for no-cors
      "Content-Type": "application/x-www-form-urlencoded"
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: encodeURIComponent(JSON.stringify(report))
  });
  //return response.json(); // causes dtu_sdk.js?v=11:28 Uncaught (in promise) SyntaxError: Unexpected end of input (at d.. due to no-cors
}

// curryer function for event listener to make named function to be able to remove event listener
// https://stackoverflow.com/questions/256754/how-to-pass-arguments-to-addeventlistener-listener-function
var curryer_function = function(dtu_this) { 
  return function curried_func(event) {
    let r = dtu_this.process_element(event.currentTarget); // important for nested elements: we need original, parent element event target, not nested event.target https://developer.mozilla.org/en-US/docs/Web/API/Event/Comparison_of_Event_Targets
    r['event_type'] = event.type;
    dtu_this.send_report(r);
  }
}

const DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS = {
  'A': {
    '': 'click', // yes, a.type is ''
  },
  'INPUT': {
    'select-one': 'change',
    'select-multiple': 'change',
    'datetime-local': 'change',
    'date': 'change',
    'time': 'change',
    'checkbox': 'change',
    'radio': 'change',
    'email': 'change',
    'password': 'change',
    'number': 'change',
    'range': 'change',
    'file': 'change',
    'text': 'change',
    'button': 'click',
    'submit': 'click',
    'textarea': 'change',
  },
  'BUTTON': {
    'button': 'click',
    'submit': 'click',
  },
  'SELECT': {
    'select-one': 'change',
    'select-multiple': 'change',
  },
  'TEXTAREA': {
    'textarea': 'change',
  },
}

const DEFAULT_OPERATION_MODE = 'auto';

const DEFAULT_CTAG = 'DEMO MVP';
const DEFAULT_TOPIC = 'default';
const DEFAULT_DTU_DATASET_ATTRIBUTE = "dtu";
const DEFAULT_API_URL = 'http://localhost';

//const LISTEN_TO_DEFAULT_EVENTS = true;
const SUPPORTED_ELEMENT_TAGS = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];

let DEFAULT_CALLBACK = console.log;
let DEFAULT_UID = 'you@example.com';

if (REAL_BACKEND_OPERATION) {
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

const STATUS_DEFAULT = 'Not ready';
const STATUS_READY = 'Ready';
const DEFAULT_UGIDS = ['Visitor'];


class DoTheyUse {
  constructor(config) {
    this._status = STATUS_DEFAULT;

    if (!config)
      config = {};
    else if (!this.config_is_valid(config))
      return;
    
    this._mode = config.mode || DEFAULT_OPERATION_MODE; 
    this._ctag = config.ctag || DEFAULT_CTAG;
    this._topic = config.topic || DEFAULT_TOPIC;
    this._dtu_attribute = config.dtu_attribute || DEFAULT_DTU_DATASET_ATTRIBUTE;
    this._api_url = config.api_url || DEFAULT_API_URL;
    this._callback = config.callback || DEFAULT_CALLBACK;
    this._uid = this.get_synthetic_uid();
    this._ugids = this.get_synthetic_ugids();
    this._elements_to_listen_to = [];
    this._elements_listeners_map = {};

    this._status = STATUS_READY;
  }

  set ctag(ctag) {
    this._ctag = ctag;
  }
  get ctag() {
    return this._ctag;
  }

  set topic(topic) {
    this._topic = topic;
  }
  get topic() {
    return this._topic;
  }

  set mode(mode) {
    this._mode = mode;
    this.listen(); // to reload what is listened
  }
  get mode() {
    return this._mode;
  }

  set callback(callback) {
    this._callback = callback;
  }
  get callback() {
    return this._callback;
  }

  set uid(uid) {
    this._uid = uid;
    localStorage.removeItem('synthetic_uid');
  }
  get uid() {
    return this._uid;
  }

  set ugids(ugids) {
    this._ugids = ugids;
    localStorage.removeItem('synthetic_ugids');
  }
  get ugids() {
    return this._ugids;
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
    if (config.constructor === Object)
      return true;

    const problem_description = "DOTHEYUSE is not working: config must be a dictionary, but given a: " + typeof(config);
    console.error(problem_description);
    return false;
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

    this.report.page_title = document.title;
  }

  make_report(r) {
    this.init_report();
    this.enrich_report(r);
  }

  send_report_to_callbacks() {
    let callbacks = this._callback;
    if (!Array.isArray(this._callback))
      callbacks = [this._callback];

    for (let i in callbacks) {
      let callback = callbacks[i];
      callback(this.report, this._api_url);
    }
  }

  send_report(r) {
    this.make_report(r);
    return this.send_report_to_callbacks();
  }

  collect_dtu_elements() {
    let elements_to_listen_to = [];
    const elements_with_data_dtu = document.querySelectorAll('[data-' + this._dtu_attribute + ']') || [];
    for (let i = 0; i < elements_with_data_dtu.length; i++) {
      let element = elements_with_data_dtu[i];
      if (DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS[element.tagName][element.type]) {
        if (!this.has_dtu_children(element) && element.dataset[this._dtu_attribute + 'Skip'] === undefined)
          elements_to_listen_to.push(element);
      }
      else {
        if (!this.has_dtu_children(element)) {
          console.error("Unsupported element tagged with data-dtu attribute:\n", element, "\n", "element type:", element.type, "\n", "data-dtu value:", element.dataset.dtu);
          element.parentElement.parentElement.classList.add("unsupported"); // for story book highlight and for auto test
        }
      }
    }
    //console.log(elements_to_listen_to)
    return elements_to_listen_to;
  }

  collect_all_elements() {
    let elements_to_listen_to = [];
    const supported_tags = Object.keys(DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS);

    for (let i = 0; i < supported_tags.length; i++) {
      let tag = supported_tags[i];
      let elements = document.querySelectorAll(tag);
      for (let j = 0; j < elements.length; j++) {
        let element = elements[j];
        const supported_tags_types = Object.keys(DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS[tag])
        if (supported_tags_types.includes(element.type) && element.dataset[this._dtu_attribute + 'Skip'] === undefined) {
          elements_to_listen_to.push(element);
        }
        //else if (element.type != 'hidden')
        //  console.warn(element)
      }
    }
    //console.log(elements_to_listen_to)
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
    for (let i = 0; element && element !== document; element = element.parentNode ) { // https://gomakethings.com/how-to-get-all-parent-elements-with-vanilla-javascript/#1-get-all-parents
      let element_data_dtu = element.getAttribute('data-dtu');
      if (element_data_dtu !== null) {
        if (element_data_dtu != '')
          parents.push(element_data_dtu);
        else {
          let element_description = this.describe_element(element);
          if (['ok', 'inner_text_substitute'].includes(element_description.status))
            parents.push(element_description.inner_text);
          else
            console.error(element_description);
        }
      }
      else {
        if (i == 0) { // element get_path was originally called for
          let element_description = this.describe_element(element);
          if (['ok', 'inner_text_substitute'].includes(element_description.status))
            parents.push(element_description.inner_text);
          else
            console.error(element_description);
        }
      }
      i++;
    }
    //console.log(parents)
    return parents.reverse();
  }

  process_element(element) {
    let r = {};

    const element_description = this.describe_element(element);

    r['element'] = element_description['inner_text'];
    r['element_path'] = this.get_element_path(element);
    
    const element_type = element_description['element_type'];
    r['element_type'] = element_type;

    const element_tag = element_description['tag'];
    if ('A' == element_tag)
      r['element_type'] = 'anchor'; // as type = '' for this element type
    else if ('BUTTON' == element_tag)
      r['element_type'] = 'button'; // as type = '' for this element type
    else if (['UL', 'OL'].includes(element_tag))
      r['element_type'] = 'list'; // as type = '' for this element type

    r['value'] = element_description['value'];

    if (['checkbox', 'radio'].includes(element_type))
      r['checked'] = element.checked;

    if (['password', 'text', 'textarea'].includes(element_type))
      r['value'] = element_description['value'].length; // send number of symbols rather than content

    if ('file' == element_type) {
      const files = [];
      for (var i = 0; i < element.files.length; i++) {
        let file_name = element.files[i].name;
        files.push(file_name);
      }
      r['value'] = files; // send file name(s) rather than files
    }

    if (['select-one', 'select-multiple'].includes(element_type)) {
      const options = element.selectedOptions; // https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box
      const values = Array.from(options).map(({ value }) => value);
      r['value'] = values;
    }

    return r;
  }

  prettify_url(url) { // is used as a substitute for inner_text for A tag when no inner text found
    if (url.indexOf('?') > 0)
      url = url.substring(0, url.indexOf('?')); // cut all url params after ? in url
    if (url[url.length - 1] == '/')
      url = url.substring(0, url.length - 1); // cut trailing '/' in url
    return url;
  }

  get_nested_inner_text(node, accumulator) { // https://stackoverflow.com/questions/67134998/javascript-recursion-to-get-innertext
    if (!accumulator)
      accumulator = [];

    if (node.dataset)
      if (node.dataset[this._dtu_attribute + "Skip"] !== undefined)
        return accumulator;
    
    if (node.nodeType === 3) {// 3 == text node
      let node_text = node.nodeValue.trim();
      if (node_text != '') {
        accumulator.push(node_text);
      }
    }
    else {
      if (node.getAttribute("aria-label")) {
        accumulator.push(node.getAttribute("aria-label").trim());
      }
      else if (node.innerText) {
        accumulator.push(node.innerText.trim());
      }
      else if (node.childNodes) {
        for (let child of node.childNodes)
          this.get_nested_inner_text(child, accumulator)
      }
    }

    //console.log(accumulator)
    return accumulator;
  }

  get_text(node) {
    let outer_text = node.innerText;
    for (; node && node !== document; node = node.parentNode ) { // https://gomakethings.com/how-to-get-all-parent-elements-with-vanilla-javascript/#1-get-all-parents
      outer_text = this.get_nested_inner_text(node);
      if (outer_text != '')
        break;
    }
    return {'outer_text': outer_text};
  }

  describe_element(node) {
    let return_value = {};
    return_value['element_type'] = node.type;
    return_value['tag'] = node.tagName;
    return_value['value'] = node.value;

    let text = this.get_nested_inner_text(node);
    let inner_text = text;

    if (node.dataset) {
      if (node.dataset[this._dtu_attribute]) 
        text = [node.dataset[this._dtu_attribute]]; // if manually set dtu tag, then use its value
    }

    if (text.length == 0 || (text.length == 1 && text[0] == '')) {
      return_value['status'] = 'no_inner_text'
      
      const outer_text_type_and_tag = this.get_text(node);
      if (outer_text_type_and_tag['outer_text'] !== '') {
        text.push(outer_text_type_and_tag['outer_text']);
        //return_value['element_type'] = outer_text_type_and_tag['element_type'];
        //return_value['tag'] = outer_text_type_and_tag['tag'];
      }
    
      if (![undefined, null, ''].includes(text[0]))
        return_value['status'] = 'inner_text_substitute';
      else
        return_value['web_element'] = node;
    }

    if (node.dataset) {
      if (node.dataset[this._dtu_attribute + 'Skip'] !== undefined)
        return_value['status'] = 'skip'; // in the end to override any statuses because skip is priority
    }
    if (node.getAttribute("type") == "hidden")
      return_value['status'] = 'hidden';

    return_value['inner_text'] = text.join('. ');
    if (node.tagName == 'A') {
      return_value['href'] = node.getAttribute("href");
      return_value['value'] = inner_text.join(', ');
    }
    else if (node.tagName == 'BUTTON') {
      if (!node.value)
        return_value['value'] = inner_text.join(', ');
      else
        return_value['value'] = node.value;
    }
    else if (node.tagName == 'INPUT') {
      if (node.type == 'checkbox' || node.type == 'radio')
        return_value['checked'] = node.checked;
    }

    if (!return_value['status'])
      return_value['status'] = 'ok';

    return return_value;
  }

  d() {
    let stats = {};
    for (let i = 0; i < SUPPORTED_ELEMENT_TAGS.length; i++) {
      let tag = SUPPORTED_ELEMENT_TAGS[i];
      let found_tags = document.querySelectorAll(tag);
      for (let j = 0; j < found_tags.length; j++) {
        let each_tag = found_tags[j];
        let element_description = this.describe_element(each_tag)
        console.log(element_description, each_tag)
        
        if (element_description.status in stats)
          stats[element_description.status] += 1;
        else
          stats[element_description.status] = 1;
      }
    }
    console.log(stats);
  } 

  describe() {
    for (let i = 0; i < this._elements_to_listen_to.length; i++) {
      let element = this._elements_to_listen_to[i];
      let event_type = DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS[element.tagName][element.type];
      let r = this.process_element(element);
      r['event_type'] = event_type;
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
        console.log('callback:', this._callback);
        if (REAL_BACKEND_OPERATION)
          console.log('API url:', this._api_url);
        console.log('');
      }

      console.log('element path:', this.report.element_path.join(' > '));
      console.log('element type:', this.report.element_type);
      console.log('event type:', this.report.event_type);
      console.log('current value(s):', this.report.value);

      console.log('')
    }
    console.log('Totally:', this._elements_to_listen_to.length, 'element(s)');
  }

  stop() {
    this.unlisten();
  }

  unlisten() { // https://stackoverflow.com/questions/55650739/how-to-remove-event-listener-with-currying-function
    if (this._elements_to_listen_to.length > 0) {
      for (let i = 0; i < this._elements_to_listen_to.length; i++) {
        const element = this._elements_to_listen_to[i];
        const event_to_listen = DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS[element.tagName][element.type];
        const listener_id = element.dataset[this._dtu_attribute + "ListenerId"];
        const listener_function = this._elements_listeners_map[parseInt(listener_id)];
        element.removeEventListener(event_to_listen, listener_function, false);
        element.removeAttribute("data-" + this._dtu_attribute + "-listener-id");
      }
      this._elements_to_listen_to = [];
      this._elements_listeners_map = {};
    }
  }

  listen() {
    // do not listen if not yet ready: if in setup yet or if broken
    if (this._status != STATUS_READY)
      return;

    if (this.mode == 'manual')
      this._elements_to_listen_to = this.collect_dtu_elements();
    else
      this._elements_to_listen_to = this.collect_all_elements();

    for (let i = 0; i < this._elements_to_listen_to.length; i++) {
      const element = this._elements_to_listen_to[i];
      try {
        const event_to_listen = DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS[element.tagName][element.type];
        // Prevention of adding listener to an element which is already being listened:
        // https://stackoverflow.com/questions/11455515/how-to-check-whether-dynamically-attached-event-listener-exists-or-not
        if (element.dataset[this._dtu_attribute + "ListenerId"] !== undefined)
          continue;

        const listener_function = curryer_function(this);
        element.addEventListener(event_to_listen, listener_function, false);

        // https://stackoverflow.com/questions/55650739/how-to-remove-event-listener-with-currying-function
        const listener_id = Object.keys(this._elements_listeners_map).length + 1; // assigning id to remove / update listeners by id
        this._elements_listeners_map[listener_id] = listener_function;

        // When dtu.listen() is called in order not to listen again already listened elements
        // and due to no standard in-browser way of knowing if element has any listeners:
        // https://stackoverflow.com/questions/11455515/how-to-check-whether-dynamically-attached-event-listener-exists-or-not
        // we add attribute which will allow prevention of listening again:
        //element.setAttribute("data-dtu-listened", true);
        element.dataset[this._dtu_attribute + "ListenerId"] = listener_id;
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

  // Return object for calling it's methods in browser / JS code
  return dtu;
}

try { // for jest unit tests
  exports.dotheyuse = dotheyuse; 
  exports.DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS = DEFAULT_SUPPORTED_TAGS_TYPES_EVENTS;
}
catch (error) {} // to mute an error "Uncaught ReferenceError: exports is not defined" in browser's dev console

const dtu = dotheyuse();