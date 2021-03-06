var test = require("tape"),
    isFunction = require("@nathanfaucett/is_function"),
    Component = require("../src/Component"),
    View = require("../src/View");


test("View.create", function(assert) {
    var divView = View.create("div", {
        className: 'foo',
        key: 'div-key',
        ref: 'divElem'
    });

    assert.equal(divView.type, "div", "constructs correct type");
    assert.equal(divView.key, "div-key", "constructs correct key");
    assert.equal(divView.ref, "divElem", "constructs correct ref");
    assert.equal(divView.props.className, "foo", "adds non-special config options to props");

    function tmpComponent(props, children, context) {
        Component.call(this, props, children, context);
    }
    Component.extend(tmpComponent, "tmpComponent");

    tmpComponent.defaultProps = {
        foo: "bar"
    };

    var cv = View.create(tmpComponent, {
        className: "c"
    });

    assert.equal(isFunction(cv.type), true, "creates view of type function from component");
    assert.equal(View.isViewComponent(cv), true, "creates a view component");
    assert.equal(cv.props.foo, "bar", "sets defaultProps");
    assert.equal(cv.props.className, "c", "merges in defaultProps with passed props");

    assert.throws(function() {
        var invalidChildType = function() {};
        View.create(tmpComponent, {}, invalidChildType);
    }, /child of a View must be a String, Number or a View/, "child must be String, Number, or View");

    assert.end();

});

test("View.create with children", function(assert) {
    var tmp = View.create("div", {
            key: "d"
        },
        0
    );

    assert.equal(tmp.children.length, 1, "inserts child views");
    assert.equal(View.isPrimitiveView(tmp.children[0]), true);
    assert.equal(tmp.key, "d");

    var tmp1 = View.create("div", {
            key: "d"
        },
        View.create("span", {
            className: "s"
        }),
        "hello world",
        45
    );

    assert.equal(tmp1.children.length, 3, "inserts child views");
    assert.equal(View.isPrimitiveView(tmp1.children[0]), false, "view is not primitive");
    assert.equal(View.isPrimitiveView(tmp1.children[1]), true, "string is primitive view");
    assert.equal(View.isPrimitiveView(tmp1.children[2]), true, "number is primitive view");

    var tmp2 = View.create("div", [
        View.create("span", {
            ref: "s"
        }),
        View.create("p", {
            ref: "p"
        }),
        "hello world"
    ]);

    assert.equal(tmp2.children.length, 3, "inserts child views as an array");
    assert.equal(tmp2.children[0].ref, "s", "inserts first child");
    assert.equal(tmp2.children[1].ref, "p", "inserts second child");
    assert.equal(View.isPrimitiveView(tmp2.children[2]), true, "inserts third child");

    var tmp3 = View.create("span", "hello world");
    assert.equal(tmp3.children.length, 1, "inserts child primitive view with no config opts");
    assert.equal(tmp3.type, "span", "creates view");

    assert.end();
});

test("View.createFactory", function(assert) {

    var spanView = View.createFactory("span");

    var sv = spanView({
        className: "s",
        ref: "s",
        key: "s"
    }, [
        "hello world"
    ]);

    assert.equal(sv.type, "span", "factory creates view");
    assert.equal(sv.key, "s", "factory adds key to view");
    assert.equal(sv.ref, "s", "factory adds ref to view");
    assert.equal(sv.props.className, "s", "factory adds props to view");
    assert.equal(sv.children.length, 1, "factory inserts children to view");
    assert.end();
});

test("View.prototype.copy", function(assert) {

    var spanView = View.create("span", {
            key: "s",
            ref: "s",
            className: "s"
        }),
        divView = View.create("div", {
            className: "d"
        });

    var copyResult = spanView.copy(divView);

    assert.equal(copyResult.type, "div", "overrides type when copying from other view");
    assert.equal(copyResult.key, null, "overrides key when copying from other view");
    assert.equal(copyResult.ref, null, "overrides ref when copying from other view");
    assert.equal(copyResult.props.className, "d", "overrides props when copying from other view");
    assert.equal(copyResult, spanView, "keeps same object instance");

    assert.end();
});

test("View.prototype.clone", function(assert) {

    var tmp = View.create("span", {
            key: "s",
            ref: "s",
            foo: "bar"
        }),
        t2 = tmp.clone();

    assert.equal(t2.key, "s", "clones key");
    assert.equal(t2.ref, "s", "clones ref");
    assert.equal(t2.props.foo, "bar", "clones props");
    assert.notEqual(t2, tmp, "creates new object instance");

    assert.end();
});

test("View.clone", function(assert) {
    var tmp = View.create("span", {
            key: "s",
            ref: "s",
            foo: "bar"
        }),
        tmp2 = View.clone(tmp, {
            key: "new",
            ref: "new",
            foo: "foo"
        }, "Child");

    assert.equal(tmp2.type, "span");
    assert.equal(tmp2.key, "new");
    assert.equal(tmp2.ref, "new");
    assert.deepEqual(tmp2.props, {
        foo: "foo"
    });
    assert.deepEqual(tmp2.children[0], "Child");

    assert.end();
});

test("View.prototype.toJSON", function(assert) {

    var tmp = View.create("div", {
        className: "d"
    }, [
        View.create("span"),
        "primitive view"
    ]);

    var tmpJson = tmp.toJSON();
    assert.equal(View.isViewJSON(tmpJson), true, "converts view to JSON");

    assert.end();
});