Defining the data
=================

The first step to start in Chevere is to know what properties a ChevereNode has:

```typescript
interface ChevereNodeData {
    readonly name?: string;
    data?: Data<any>;
    init?: initFunc;
    methods?: Data<Function>;
    watch?: Data<Watch>;
    readonly beforeUpdating?: () => void;
    readonly updated?: () => void;
}
```

## Special case

As you can see, all properties are optional, but one of them is a special case: **name**

Depending of the way that you want to initialize ``Chevere``, **name** has a suitable behavior with it

If you initialized ``Chevere`` with the *``Chevere.search``* method, in all **Attached nodes**, name must be defined, otherway it isn't necessary, for example...

```html
<div data-attached="test">
    <span data-text="this.data.msg"></span>
</div>
<div data-inline="{ data: { msg: 'Hello world'} }">
    <span data-text="this.data.msg"></span>
</div>
<script>
    Chevere.search({
        name: 'test',
        data: {
            msg: "Hello world"
        }
    });
</script>
```

As you see, the *``data-attached``* attribute has as value the name of the data passed as argument to the *``Chevere.search``* method, then, the ``div[data-attached]`` data will **that argument**, the ``div[data-inline]`` doesn't need to have a name.

## Reactive properties

If you've worked with **Vue.js** before, you must have realized of the *``data``* and *``methods``* properties

When you register a property in *``data``* or in *``methods``*, under the hood, a javascript [*``Proxy``*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) is created, and thanks to that, ``Chevere`` can track the changes

Another fact that you must have realized is that *``data``* can also be undefined. Consider the following example:

```html
<div data-inline>
    <span data-text="`Hello world`"></span>
</div>
```

The ``span[data-text]`` will have **'Hello world'**
as *``textContent``*


 
**Important: Although *``data``* has been declared of type *``Data<any>``*, you mustn't define functions in there**

### Deeper on reactivity

Consider the following example:

```html
<div>
    <span data-text="this.data.msg"></span>
    <button @onClick="this.methods.newMsg()">Click</button>
</div>
<script>
    Chevere.make({
        data: {
            msg: 'Hello world'
        },
        methods: {
            newMsg() {
                this.data.msg = 'Chevere'
            }
        }
    }, document.querySelector("div"));
</script>
```

When ``button`` is clicked, the content of ``span[data-text]`` will have changed to *'Chevere'*

Ok, that's a very simple example of the function of a javascript *``Proxy``*, but, what would happen when the ``button`` element is clicked on the following code...

```html
<div>
    <span data-text="this.data.quotes"></span>
    <button @onClick="this.methods.addQuote()">Click</button>
</div>
<script>
    Chevere.make({
        data: {
            quotes: ["Chevere", "Naguara"]
        },
        methods: {
            addQuote() {
                this.data.quotes.push("Chamo");
            }
        }
    }, document.querySelector("div"));
</script>
```

Nothing will happen, because a javascript *``Proxy``* is not an array, is an **object**, if you want a ``ChevereNode`` to react to this, you must do an assignment, so, the ``addQuote`` method would look like this

```javascript
addQuote() {
    this.data.quotes = [...this.data.quotes, "Chamo"];
}
```

That code do will make the ``ChevereNode`` to react

### Watch

The **``Watch``** property is exactly like the [**Vue's watch**](https://v3.vuejs.org/api/computed-watch-api.html#watch) API, it could be defined as the follow way:

```javascript
const data = {
    name: 'test'
    data: {
        msg: 'Hello world'
    },
    watch: {
        msg(oldValue, newValue) {
            //Do something
        }
    }
};
```

So as you can see, you should declare a method with the name of a **data**, otherway you will receive a ***ReferenceError***

***Important: You must not call a watch anywhere of your code, they will called at the right time***

### About *``init``*, *``beforeUpdating``* and *``updated``*, you should read the [`Lifecycle`](./lifecycle.md) document