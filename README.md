# JavaScript SDK for ["Do They Use"](https://dotheyuse.com) service

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

## How it works
When installed in web page (see for example [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html)), SDK listens to events from specified (tagged by `data-dtu` attribute by default) elements on web page, builds JSON reports and sends them to specified `callback` (which is `console.log` by default) function. `callback` could be a function that sends these reports to API (and this is how this SDK is used in "Do They Use" service).

## How to install
1. At the bottom of your web page (right before `</body>` closing tag) import and init SDK with any `ctag` (for example, `TEST CTAG`):
```
  <script src="https://raw.githubusercontent.com/alexeyhimself/dtu_sdk_js/main/dtu_sdk.js"></script>
  <script type="text/javascript">
    const dtu = dotheyuse({
      'ctag': 'TEST CTAG',
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
Ready
```
(you can try this in [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html)).

## How to use
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
{ctag: 'TEST CTAG', topic: 'default', feature: 'some dropdown', feature_path: ['some dropdown'], value: 'value 2', …}
```
You can try it in in [SDK demo HTML page](https://alexeyhimself.github.io/dtu_sdk_js/dtu_sdk_js_demo.html).
