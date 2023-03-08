# JavaScript SDK for ["Do They Use"](https://dotheyuse.com) service 
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/alexeyhimself/dtu_sdk_js/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/alexeyhimself/dtu_sdk_js/tree/main)

## About "Do They Use" service
["Do They Use"](https://dotheyuse.com) service is made to help teams to make data-driven decisions for their products. 
They way it helps to make data-driven decisions - is by providing ready-to-go quantitative data reports about their product usage by users for the teams. 

Service works similarly to Google Analytics, but aims not Marketing and Sales teams, but Product teams. It helps teams to find answers on the following quantitative questions:
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
1. Open [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html)
2. Open browser's dev console
3. Change drop-down value on demo page

What to expect: on each drop-down value change in console will appear new report.

## How it works
When installed in web page (see for example [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html)), SDK listens to events from specified (tagged by `data-dtu` attribute by default) elements on web page, builds JSON reports and sends them to specified `callback` (which is `console.log` by default) function. `callback` could be a function that sends these reports to API (and this is how this SDK is used in "Do They Use" service).

## How to install on web-page
1. At the bottom of your web page (right before `</body>` closing tag) import and init SDK with any `ctag` (for example, `TEST CTAG`):
```
  <script src="https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk.js"></script>
  <script type="text/javascript">
    const dtu = dotheyuse({
      'ctag': 'DTU CTAG',  // DTU CTAG - is a tag from "Do They Use" service
    });
  </script>
```
(check out how it is done in [code of SDK demo HTML page](https://github.com/alexeyhimself/dtu_sdk_js/blob/main/dtu_sdk_js_demo.html))

2. Check that SDK was installed correctly. In browser's dev console execute:
```
dtu.status
```
Correctly installed SDK will reply:
```
'Ready'
```
(you can try this in [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html)).

Incorrectly installed SDK will reply with an error message related to that specific problem.

## How to use
### Basic usage
1. To any (of [supported types](/dtu_sdk.js#L6)) element of your web page add `data-dtu` attribute. For example:
```
<select data-dtu="some dropdown">
  <option>value 1</option>
  <option>value 2</option>
</select>
```
2. Fire supported event for this element. For example, change value in this drop-down.
3. In browser's dev console you will see:
```
{ctag: 'DTU CTAG', topic: 'default', feature: 'some dropdown', value: 'value 2', …}
```
You can try it in in [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html).

### Advanced usage
1. Set your own `callback` (`my_custom_function`, for example) function:
```
<script type="text/javascript">
  const dtu = dotheyuse({
    'ctag': 'DTU CTAG',
    'callback': my_custom_function
  });
</script>
```
3. Disable automatic bind to elements to `listen` events
```
<script type="text/javascript">
  const dtu = dotheyuse({
    'ctag': 'DTU CTAG',
    'listen': false
  });
</script>
```
5. Change default (`data-dtu`) bind attribute (to `data-testid` for example):
```
<script type="text/javascript">
  const dtu = dotheyuse({
    'ctag': 'DTU CTAG',
    'dataset-attribute': 'testid'
  });
</script>
```
**Please note**, that `data-` preffix is omited.


## How to run tests
1. Install [Jest](https://jestjs.io/docs/getting-started) framework:
```
npm install --save-dev jest
```
2. In project directory run:
```
npm test
```

## How to check test coverage
1. In project directory run:
```
npx jest --coverage
```
2. In project directory will appear `coverage` directory with `index.html` and `dtu_sdk.js.html` files


## License
GNU GPLv3
