Browser address autofill can sometimes do weird things: by default it tries to guess if an `<input>` should be autofilled, using `name` attribute, or `<label>` string.

If `<label>` starts with "Name" (or "Nom" en français), it will autofill as if field has `autocomplete="family-name"` or `autocomplete="given-name"` or `autocomplete="name"`

* for firstname/lastname, you should use the specific `autocomplete` value
* for birthname... no good solution:
  * `<input autocomplete="off">` does not work 😭
  * either ensure the `<label>` does not start with "Name"
  * or use a mostly unused `autocomplete` value, for example `autocomplete="url"`

Ref: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill

# Tests

* [html test file](test.html)
* Chromium test : [screenshot](test-chromium.png)
* Firefox test : [screenshot](test-firefox.png)