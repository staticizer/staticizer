# Staticizer

> A static site generator built with webpack and handlebars templating

## Project structure

```
/dist
/src
  |-/assets
  |-/components
  |-/helpers
  |-/layouts
  |-/pages
  |-/static
staticizer.config.js
```

## Running

Staticizer can be run in `build` and `dev` modes.

Build mode simply assembles all your templates and assets into `/dist` folder. It can be
run by simply executing `staticizer` (or short version `sz`), or `staticizer build`.

Dev mode launches `webpack-dev-server` with live reload (HMR is currently not supported yet).
It can be run using `staticizer dev`.

## Concepts

Staticizer is a framework that renders your *pages* from their templates into raw html markup.
Pages are wrapped with *layouts* and contain dynamic (at compile time) content that is rendered
using *page data objects*, *helpers* and *components*.

### Pages

Every template in `/src/pages` is processed to generate an `.html` page in `/dist` folder.
Every page has it's layout that can be changed with `set_layout` helper.
At first, the page template itself is rendered to define its layout, title and other properties.
Than it's layout is rendered with `body` argument that contains previous render result.

### Page Data Object

Page data object is a simple js object with properties that are accessible during page render.
It is mostly for storing the data that you define in `staticizer.config.js`, but also it contains
some service entries, like current page name.

### Layouts

Layout is a page wrapper. All pages have an `default.hbs` as their layout, until changed.
Layouts should contain common page parts, like `<html>` tag, meta tags, may be common page
header and footer. `{{{body}}}` should be used to render the page body.

### Helpers

Helpers are just Handlebars helpers. They are registered globally and visible inside every layout,
page or component. Staticizer provides some common built-in helpers, but you are free to define yours.
To do this, simply place a file `helper_name.js` in `/src/helpers` that exports single function. That
function is registered as a Handlebars helper with name `helper_name`.

### Components

Components are parameterized templates, like Handlebars partials, but a bit more complicated.
To create a component, place a file `ComponentName.hbs` somewhere inside `/src/components` directory.
After this, you can use it as `{{ComponentName}}` in any template.
Components that accept properties should have also file `ComponentName.js` in the same folder.
This file should export an instance of `staticizer.SzComponent` that describes component properties.

### Component Properties

There are two ways to pass a property into a component: as an unnamed argument and as a named one.
The first are defined as `args` argument for `SzComponent` constructor, and the second as `kwargs`.
Their definition may include its `type`, `default` value, `required` specification. Args also must
contain `name` property that stores the name, under which its value will be accessible in template,
and may contain `kwarg` property that allows to use this arg as a kwarg.

### Static Files

Static files are files that are just copied by `copy-webpack-plugin` from `/src/static` into
`/dist` without changes. This directory is meant to store images, fonts and some other objects.

### Assets

Assets are webpack-bundled files that contain scripts, styles and anything else webpack can handle.
By default, Staticizer can handle `js` and `css` files, but you can extend this with *pipelines*.
Every asset that you want to use on the page should be bundled using `bundle` helper. It works
pretty much like `require` in `js` files when they are processed with webpack. After building a page,
all javascript assets will be extracted into their own bundle, the same as all style assets will.
These bundles should be injected into your pages in layouts using `js_bundle` and `css_bundle`
respectively. When page will be rendered, these helper calls will be replaced with `script` and
`link` tags referencing the bundle that webpack has assembled for you.

### Asset Pipelines

If you want to use `less`, `stylus`, `sass` or any other language to declare you styles, you should
use an *asset pipeline*. To create a pipeline, add `pipelines` section to `staticizer.config.js`.
In this section, add `css` (or `js`) property that contains webpack rule description.
For example, to use `stylus` for styles and `babel` for `js`, your `pipelines` section should look
like this:

```
pipelines: {
    css: [
        {
            test: /\.styl$/,
            use: [{ loader: 'stylus-loader' }]
        }
    ],
    js: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
    }]
}
```

Please note that for css files you don't need to use a `css-loader`, `style-loader`, etc. All further
transformations are handled by Staticizer, so you need just a way to convert your source to `css`.

## Configuration

You can see that there is a file named `staticizer.config.js` at the root of your project.
It specifies Staticizer configuration options that will be used during render process. This file
should export an object that may contain the following sections.

### `output`

This section configures Staticizer output. It can have the following properties:

| Name | Default value | Description |
|---|---|---|
| `assetsPrefix` | `'assets'` | Name for subdirectory where your bundles will be placed (false for placing directly in `/dist`). |
| `staticPrefix` | `false` | Name for subdirectory where your static files will be copied. |
| `minify` | `false` | Should pages and assets be minified. You can pass a hash instead of boolean. |
| `minify.html` | `false` | Should pages be minified. Can be an object of `html-minifier` settings. |
| `minify.js` | `false` | Should js bundles be minified. Can be an object of `terser-webpack-plugin` settings. |
| `minify.css` | `false` | Should css bundles be minified. Can be an object of `optimize-css-assets-webpack-plugin` settings. |

### `layout`

Defines default layout options. For now, contains the only property.

| Name | Default value | Description |
|---|---|---|
| `default` | `'default'` | Name of the layout used by default |

### `data`

Specifies user-defined data for page rendering.

| Name | Default value | Description |
|---|---|---|
| `common` | `{}` | Data that is visible for all pages |
| `pages` | `{}` | Data that is visible only for a specific page |

`pages` property is a hash, which entries are data objects specifical for the pages, e.g.

```
pages: {
    'index': { foo: 'bar' },
    'inner/index': { foo: 'baz' }
}
```

For this example, variable `foo` will have a value of `'bar'` for `/src/pages/index.hbs`,
a value of `'baz'` for `/src/pages/inner/index.hbs`, and will not be visible for any other page.

### `devServer`

A configuration object for `webpack-dev-server`. Also may contain additional props:

| Name | Default value | Description |
|---|---|---|
| `'404'` | `'/404.html'` | Page to render when 404 error occures |

### `pipelines`

A description of pipelines (see appropriate section in Concepts).

### `aliases`

A set of webpack aliases, passed directly to webpack.

### `mode`

Webpack mode, `'production'` or `'development'`.
