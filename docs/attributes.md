Attributes
========================

The data in ``Chevere``, are building with *``data-``* attributes, without them, ``Chevere`` is useless

Here are all the attributes that you can use in ``Chevere``, *descriptions* and *illustrations* are below:

| Attribute | Use to |
| --------- | ------ |
| [*data-attached*](#data-attached)| Refer a data defined in the ``Chevere.search`` method |
| [*data-inline*](#data-inline)| Define a self-data node |
| [*data-init*](#data-init) | Pass argument to the ``init()`` method |
| [*data-text*](#data-text)| Set ``textContent`` on an element |
| [*data-show*](#data-show)| Set the ``display:none;`` in an element by a boolean value |
| [*data-model*](#data-show)| Synchronize a ``data`` property and an ``input`` value  |
| [*data-on*](#data-on) |  Add an event listener to an element |
| [*data-bind*](#data-bind)| Bind an **html** attribute value by a given expression |
| [*data-for*](#data-for) | To loop into a given array |

# *data-attached*

Check [this](./INDEX.md)

# *data-inline*

Check [this](./INDEX.md)


# *data-init*

Check [this](./lifecycle.md#init())

# *data-text*

``data-text`` attribute set the ``textContent`` of an element by evaluate a given expression

```html
<div data-inline="{ data: { msg: 'Chevere' } }">
    <p data-text="this.data.msg"></p>
    <p data-text="`Chevere`"></p>
</div>
```

**It only accepts template literals or a `this.data` reference**

# *data-show*

``data-show`` attribute toggle the ``display:none;`` property in an element

```html
<div data-inline="{ data: { bool: true } }">
    <p data-show="this.data.bool">Chevere</p>
    <p data-show="this.data.bool == false">es</p>
    <p data-show="true || false">chevere!</p>
</div>
```
Only the first and last ``p`` elements are visible

**It only accepts booleans and logical operators**

# *data-model*

``data-model`` attribute synchronize a ``data`` property and an input value

```html
<!-- Are you sick of the 'msg' property :) ? --->
<div data-inline="{ data: { msg: 'Hello world' } }">
    <input type="text" data-model="this.data.msg"/>
</div>
```

At first, ``input`` will have as value, *'Hello world'*, and if it changes, the ``this.data.msg`` will change too

This works fine with all ``input`` types, ``textarea`` and ``select`` elements

But, what do you think that would happen on this example...

```html
<div data-inline="{ data: { msg: '' } }">
    <input type="checkbox" value="Chevere" data-model="this.data.msg"/>
    <input type="checkbox" value="Chamo" data-model="this.data.msg"/>
    <input type="checkbox" value="Naguara" data-model="this.data.msg"/>
</div>
```

If you tried this, you should receive something like this when all checkbox are checked: 

```html 
Chevere,Chamo,Naguara
```

And when none of them are checked:

```html
false
```

This happens because ``Chevere``, when found multiple ``input[type='checkbox']:checked`` with the same value in the ``data-model`` attribute, it makes an ``Array`` with all their values, otherwise, if none of them are checked, there's nothing to make an array, so ``false`` is returned instead

# *data-on*

``data-on`` is a quick way alternative to *``addEventListener``*:

```html
<div data-inline="{ 
    data: {}, 
    methods: {
        someMethod() {
            alert('¿Todo bien?')
        } 
    }
}">
    <button data-on:click="this.methods.someMethod()">Click</button>
</div>
```
Of course ``data-on:event`` is really boring, so, we prefer to use this:

```html
<button @onClick="this.methods.someMethod()">Click</button>
```

More concise and readable, don't you think?

You can also have access to two variables: ``$el`` and ``$event``

``$el`` is equal to the current element [*(event.target)*](https://developer.mozilla.org/en-US/docs/Web/API/Event/target), while ``$event`` is the current event object, you can pass it normally as arguments to the method that you want to call

## Important feature

Because ``Chevere`` don't allowed to have nested components (sorry!), it do have a way to communicate components via the ``this.$emit`` method...

```html
<div id="one" data-inline>
    <button @onClick="this.$emit({ name: 'test'})">
        Global
    </button>
    <span @onTest.window="console.log('Test window')"></span>
</div>
<div id="two" data-inline>
    <button @onTest.window="console.log('Test window')"
        @onClick="this.$emitSelf({ name: 'test'})">
        Global and self
    </button>
    <span @onTest.self="console.log('Test self')"></span>
</div>
```
If you click on the ``div#one > button`` you will see two 'Test window' on the console

But, if you click on ``div#two > button`` you will see only 'Test self' on the console

### ***Important: only methods and assignments are allowed on ``data-on`` attributes, but we recommend you to only use methods***

# *data-bind*

Better than an explanation let's see an example...

```html
<div data-inline>
    <span data-bind:style="`padding: ${5}rem;`">Hey!</span>
</div>
```
Like ``data-on`` attribute, we prefer to use the **shorthand syntax**...

```html
<div data-inline>
    <span @bindStyle="`padding: ${5}rem;`">Hey!</span>
</div>
```

## A few extra things that you need to know about 'data-bind' attributes...

1. They can be use in boolean **html** attributes, of course you must place **boolean** expressions on they

```html
<div data-inline>
    <video @bindControls="true || false">Hey!</video>
</div>
```

2. The attributes `` style`` and ``class`` can receive template literals and objects, of the latter, its structure depends on which attribute is, for instance...

```html
<div data-inline>
    <span @bindStyle="`padding: ${5}rem;`">Hey!</span>
    <span @bindStyle="{ padding: '5rem' }">Hey!</span>
    <span @bindClass="`${(true) ? 'success' : 'error'}`">Hey!</span>
    <span @bindClass="{ 'success': true, 'error': false }">Hey!</span>
</div>
```

The padding property of two ``@bindStyle`` ``span`` will be **'5rem'**, while the class of two ``@bindClass`` ``span`` will be **'success'**

***Important: As you could see, the ``@bindClass`` attribute object must have boolean as property value, and string as key name***

3. Multiple ``data-bind`` attributes can be placed at the same element, *(the same thing with ``data-on``)*

4. You can set a default value for the attribute, for instance

```html
<div data-inline>
    <span @bindStyle="`padding: {5}rem;`" style="color: blue;">Hey!</span>
</div>
```

There will be no problem with this

# *data-for*

With the ``data-for`` attribute you can execute a loop in the DOM easilly...

```html
<div data-inline="{
    data: {
        array: [1, 2, 3, 4]
    }
}">
    <template data-for="arr in this.data.array">
        <span data-text="arr"></span>
    </template>
</div>
```
## A few extra things that you need to know about 'data-for' attribute...

1. It must be placed in ``template`` elements
2. The ``template`` element must have one direct child (``template > *``) maximum
3. The value of the attribute must follow the ``[value in array]`` pattern
4. It's reactive too, so, if the ``data`` property changes, the number of elements generated in the loop changes too
5. You can place the others ``data-`` attributes on it
6. For now, ``data-for`` attribute is a bit limited, check the [ToDo](./todo.md) file for more

# Summary

Those are all the available attributes in ``Chevere``, and this is a summary of them, order by priority:

| Attribute(s) | Element(s) | Max places (same element) |
| --------- | -------- | ------------------ |
| ``data-attached/inline`` | ``*`` | **1** |
| ``data-init`` | ``*`` | **1** |
| ``data-for`` | ``template`` | **1** |
| ``data-text`` | ``*`` | **1** |
| ``data-show`` | ``*`` | **1** |
| ``data-model`` | ``input, select, textarea`` | **1** |
| ``data-on`` | ``*`` | ∞ |
| ``data-bind`` | ``*`` | ∞ |

***Important: The **main** element of a ``ChevereNode`` can't have any ``data-`` attribute different of ``data-attached/inline`` (This also apply for the nodes defined by ``makeNodes()`` method)***