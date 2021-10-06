To-Do
====

``Chevere`` is currently in **1.0.0** version, that means we're starting, there are a lot of features that we want to implement

***Important: Don't directly commit to master, make a branch with the name of the feature that you will working on and make a pull request***

# To-do list (3 at a time max)

1. Nested components

```html
<div data-attached>
    <!-- ...content -->
    <div data-inline>
        <!-- ...content -->
    </div>
    <!-- ...content -->
</div>
```

2. Better ``data-for``: It would be nice to have nested ``data-for`` loops...

```html
<template data-for="...">
    <template data-for="...">
        <!-- ...content -->
    </template>
</template>
```
...and an smarter **evaluator**, to write expressions like: ``value in Object.values(obj)`` or ``(value, i, arr) in Array``

3. A ``data-self`` node, to make an element to use a ``Chevere`` feature 

```html
<button data-self @onClick="this.$emit({ name: 'test' })">
    Click
</button>
```

# Optionals (3 at a time max)

***Only two of the below options can be implemented on the next version***
1. An ``$emitBoth()`` method (you know what I mean)
2. An ``data-ignore`` attribute
3. CSS transitions when ``data-show`` changes


### Some ideas?, if you do have one, please, help us!