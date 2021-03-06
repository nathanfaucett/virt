virt [![Build Status](https://travis-ci.org/nathanfaucett/virt.svg?branch=master)](https://travis-ci.org/nathanfaucett/virt)
======

virt is a tool for creating interactive UIs. Use views for each state in your application, and virt will find the differences and create a Transaction JSON object for the changes.

use of a renderer for the transaction is nesseecary the only one aviable right now is [virt-dom](https://github.com/nathanfaucett/virt-dom)

## Install using npm
```bash
$ npm install @nathanfaucett/virt --save
```
## Install using yarn
```bash
$ yarn install @nathanfaucett/virt --save
```

### Components

Components let you split views into reusable pieces

virt.Component is an abstract base class, so you will have to subclass it, and define at least a render() method.

```javascript
var virt = require("@nathanfaucett/virt");


// Components are used in Views like strings
// virt.createView(SomeComponent, { ... props }, ... children)
function SomeComponent(props, children, context) {
    virt.Component.call(this, props, children, context);
}
// SomeComponent.prototype = Object.create(virt.Component.prototype);
// SomeComponent.prototype.displayName = "List";
virt.Component.extend(SomeComponent, "SomeComponent");

// Called after first render and mounted
SomeComponent.prototype.componentDidMount = function() {};

// Called after first updated
SomeComponent.prototype.componentDidUpdate = function(
    previousProps, previousChildren, previousState, previousContext
) {};

// Called before component rendered and mounted
SomeComponent.prototype.componentWillMount = function() {};

// Called before component will be removed
SomeComponent.prototype.componentWillUnmount = function() {};

// Called before component will receive properties
SomeComponent.prototype.componentWillReceiveProps = function(
    nextProps, nextChildren, nextContext
) {};

// Called before component is going to update
SomeComponent.prototype.componentWillUpdate = function(
    nextProps, nextChildren, nextState, nextContext
) {};

// Called before component is updated and can return false to not re-render
SomeComponent.prototype.shouldComponentUpdate = function(
    nextProps, nextChildren, nextState, nextContext
) {};

SomeComponent.prototype.render = function() {
    return virt.createView("div", { ... props }, ... children);
};
```
