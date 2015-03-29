var indexOf = require("index_of"),
    map = require("map"),
    isFunction = require("is_function"),
    getComponentClassForType = require("./utils/get_component_class_for_type"),
    View = require("./view"),
    getViewKey = require("./utils/get_view_key"),
    diff;


var NodePrototype,
    isPrimativeView = View.isPrimativeView;


module.exports = Node;


function Node() {
    this.id = null;

    this.parent = null;
    this.children = [];
    this.root = null;

    this.component = null;

    this.renderedView = null;
    this.currentView = null;
}

NodePrototype = Node.prototype;

Node.create = function(view) {
    var node = new Node(),
        Class, component;

    if (isFunction(view.type)) {
        Class = view.type;
    } else {
        Class = getComponentClassForType(view.type);
    }

    component = new Class(view.props, view.children);
    component.__node = node;
    node.component = component;
    node.currentView = view;

    return node;
};

NodePrototype.appendNode = function(node) {
    var children = this.children;

    node.parent = this;
    children[children.length] = node;
    this.root.appendNode(node);
};

NodePrototype.removeNode = function(node, transaction) {
    var children = this.children;

    node.removeChildren(transaction);
    node.__unmount(transaction);
    node.parent = null;
    children.splice(indexOf(children, node), 1);
    this.root.removeNode(node);
};

NodePrototype.removeChildren = function(transaction) {
    var children = this.children,
        i = -1,
        il = children.length - 1;

    while (i++ < il) {
        this.removeNode(children[i], transaction);
    }
};

NodePrototype.mount = function(transaction) {
    transaction.insert(this.parent ? this.parent.id : this.id, this.id, 0, this.__renderRecurse(transaction));
};

NodePrototype.__mount = function(transaction) {
    var component = this.component,
        renderedView = this.renderedView;

    mountEvents(this.id, renderedView.props, this.root.eventManager, transaction);

    component.componentWillMount();

    transaction.queue.enqueue(function onMount() {
        component.componentDidMount();
    });
};

NodePrototype.__renderRecurse = function(transaction) {
    var _this = this,
        parentId = this.id,
        renderedView = this.render();

    renderedView.children = map(renderedView.children, function(child, index) {
        var node;

        if (isPrimativeView(child)) {
            return child;
        } else {
            node = Node.create(child);
            node.id = parentId + "." + getViewKey(child, index);
            _this.appendNode(node);

            return node.__renderRecurse(transaction);
        }
    });

    this.renderedView = renderedView;
    this.__mount(transaction);

    return renderedView;
};

NodePrototype.unmount = function(transaction) {
    var parentId = this.parent ? this.parent.id : this.id;

    if (this.parent !== null) {
        this.parent.removeNode(this, transaction);
    } else {
        this.removeChildren(transaction);
        this.root.removeNode(this);
    }

    transaction.remove(parentId, this.id, 0);
};

NodePrototype.__unmount = function(transaction) {
    var component = this.component;

    this.root.eventManager.allOff(this.id, transaction);

    component.componentWillUnmount();
};

NodePrototype.update = function(nextView, transaction) {
    var component = this.component;

    this.__update(
        component.props, nextView.props,
        component.children, nextView.children,
        component.__previousState, component.state,
        nextView,
        transaction
    );
};

diff = require("./diff");

NodePrototype.__update = function(
    previousProps, nextProps,
    previousChildren, nextChildren,
    previousState, nextState,
    currentView,
    transaction
) {
    var component = this.component,
        renderedView;

    component.componentWillReceiveProps(nextProps, nextChildren);

    if (component.shouldComponentUpdate(nextProps, nextChildren, nextState)) {

        component.props = nextProps;
        component.children = nextChildren;

        component.componentWillUpdate();

        renderedView = this.render();
        diff(this, this.renderedView, renderedView, transaction);
        this.renderedView = renderedView;
    } else {
        component.props = nextProps;
        component.children = nextChildren;
    }

    this.currentView = currentView;

    transaction.queue.enqueue(function onUpdate() {
        component.componentDidUpdate(previousProps, previousChildren, previousState);
    });
};

NodePrototype.render = function() {
    var currentView = this.currentView,
        renderedView = this.component.render();

    renderedView.key = currentView.key;
    renderedView.ref = currentView.ref;

    return renderedView;
};

function mountEvents(id, props, eventManager, transaction) {
    var eventPropNames = eventManager.propNames,
        key;

    for (key in props) {
        if (indexOf(eventPropNames, key) !== -1) {
            eventManager.on(id, key, props[key], transaction);
        }
    }
}
