# JavaScript SDK for ["Do They Use"](https://dotheyuse.com) service 
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/alexeyhimself/dtu_sdk_js/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/alexeyhimself/dtu_sdk_js/tree/main)

## About "Do They Use" service
["Do They Use"](https://dotheyuse.com) service is made to help teams to make data-driven decisions for their products. 
The way it helps to make data-driven decisions - is by providing ready-to-go quantitative data reports about their product usage by users for the teams. Teams get visual answers on various questions about their product's elements and features usage and can make decisions based on that data.

Service works similarly to Google Analytics, but aims not Marketing and Sales teams, but Product teams. This service helps teams to find answers on the following quantitative questions:
* Do users use specified (tagged) web elements (buttons, links, check-boxes, etc.)?
* If they do use them, then how many, how often they use each of them?
* Which data they choose (in check-boxes, drop-downs, etc.) and how many?
* And by the way, who of users and users groups exactly - maybe team simply don't care of them in a product (trial users, testers, managers, etc.)

This information helps team to:
* decide to remove not used element(s) at all;
* decide to take actions to increase or decrease element(s) adoption (number of users who uses them);
* decide to take actions to increase or decrease element(s) usage frequency (number of element(s) calls by some group of users);
* compose questions for gathering qualitative data from users - to ask users more specific questions, like: "we noticed, that you use these (element(s), feature(s)) a lot, can you explain why?" and then use answers on these questions when talk to users who uses less or don't use at all.

Addressed answers on these questions lead to better UX both for Product teams and for Product users. Product gets better and this better is driven not by assumptions but by real usage data by real users.

## Problems this SDK solves
* SDK is made for ["Do They Use"](https://dotheyuse.com) web service to simplify:
  * adding listeners for specified events ("click", "change", etc.) for specified elements (link, checkbox, dropdown, etc.) of web page(s) it is installed for;
  * translation these events into web log reports;
  * sending these reports to ["Do They Use"](https://dotheyuse.com) service API.
* This repository starts teamwork and collaboration for users of "Do They Use" service and of this SDK.

## Demo
1. Open [Story Book](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_story_book.html).
2. Interact with elements on demo page

What to expect: 
1. On each interaction detected change will appear in "element and value to be sent in a report" field;
2. Full report that would be sent in case of such interaction will be logged in browser's console.

## How it works
When installed in web page (see for example [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html)), SDK listens to events from specified (tagged by `data-dtu` attribute by default) elements on web page, builds JSON reports and sends them to specified `callback` (which is `console.log` by default) function. `callback` could be a function that sends these reports to API (and this is how this SDK is used in "Do They Use" service).

## Supported elements types
List of currently supported elements types is available [here](/dtu_sdk.js#L6).
You can play all currently supported elements in a [Story Book](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_story_book.html).

## Story Book
All currently supported web elements are available in a [Story Book](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_story_book.html) published with GitHub Pages.

## How to install on your web-page
1. At the bottom of your web page (right before `</body>` closing tag) import and init SDK with any `ctag` (for example, `TEST CTAG`):
```html
  <script src="https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk.js"></script>
  <script type="text/javascript">
    const dtu = dotheyuse({
      'ctag': 'DTU CTAG',  // DTU CTAG - is a tag from "Do They Use" service
    });
  </script>
```
(check out how it is done in [code of SDK demo HTML page](https://github.com/alexeyhimself/dtu_sdk_js/blob/main/dtu_sdk_js_demo.html) and how it works on [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html) itself).

2. Check that SDK was installed correctly. In browser's dev console execute:
```js
dtu.status
```
Correctly installed SDK will reply:
```js
'Ready'
```
(you can try this in [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html) as well).

Incorrectly installed SDK will reply with an error message related to that specific problem.

## How to use
### Basic usage
1. To any (of [supported types](/dtu_sdk.js#L6)) element of your web page add `data-dtu` attribute. For example:
```html
<select data-dtu="some dropdown">
  <option>value 1</option>
  <option>value 2</option>
</select>
```
2. Fire supported event for this element. For example, change value in this drop-down.
3. In browser's dev console you will see:
```js
{ctag: 'DTU CTAG', topic: 'default', feature: 'some dropdown', value: 'value 2', …}
```
You can try it in in [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html).

### Advanced usage
1. Set your own `callback` (`my_custom_function`, for example) function:
```js
<script type="text/javascript">
  const dtu = dotheyuse({
    'ctag': 'DTU CTAG',
    'callback': my_custom_function
  });
</script>
```
2. Disable automatic bind to elements to `listen` events
```js
<script type="text/javascript">
  const dtu = dotheyuse({
    'ctag': 'DTU CTAG',
    'listen': false
  });
</script>
```
3. Change default (`data-dtu`) bind attribute (to `data-testid` for example):
```js
<script type="text/javascript">
  const dtu = dotheyuse({
    'ctag': 'DTU CTAG',
    'dtu_attribute': 'testid'
  });
</script>
```
**Please note**, that `data-` preffix is omited.

4. Specify `topic` explicitly:
```js
<script type="text/javascript">
  const dtu = dotheyuse({
    'ctag': 'DTU CTAG',
    'topic': 'custom'
  });
</script>
```


## How to run tests
1. Install [Jest](https://jestjs.io/docs/getting-started) framework:
```bash
npm install --save-dev jest
```
2. In project directory run:
```bash
npm test
```

## How to check test coverage
1. In project directory run:
```bash
npx jest --coverage
```
2. In project directory will appear `coverage` directory with `index.html` and `dtu_sdk.js.html` files


## License
[GNU GPLv3](/LICENSE)
