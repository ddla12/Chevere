Chevere
=======
Is your project not enough complex to use a modern framework like *Vue, Angular or React*?

To help you to save time and lines of code, we bring you ***Chevere***...

```html
<div data-inline="{ data: { msg: 'Hello world' } }">
    <em data-text="this.data.msg"></em>
</div>
<script>Chevere.search()</script>
```

### You can setup your frontend behavior with only *data-* attributes! That's it!

<br>

Do you wanna know more?, Then look for the [``docs/``](./docs/INDEX.md) folder of this repo

Contribution
===========

## Setup a local environment
1. Clone this repo locally
2. Run ``npm install``
3. Open `index.html` and you're good to go!

## Project Structure

| Folder        | Description |
| ------------- | ----------- |
| ``dist``      | Compiled Chevere code, either CDN and module build    |  
| `docs`        | Chevere's documentation   |
| ``test``      | Chevere's unit-test folder, contains all ``.spec`` files    |
| ``src``       | Chevere's core    |

## Commands
| Command | Description |
| ------- | ----------- |
| ``npm run test`` | Run project's unit tests |
| ``npm run build``| At first, transpile all ``.ts`` files of the ``.src`` folder, then, compile all the ``.js`` files to generate the CDN build|
|``npm run format``| Prettier command |

**We prefer a project with an OOP approach, keep it in mind**