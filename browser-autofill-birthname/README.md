Browser address autofill can sometimes do weird things: by default it tries to guess if an `<input>` should be autofilled, using `name` attribute, or `<label>` string.

If `<label>` starts with "Name" (or "Nom" en français), Chrome/Firefox will autofill as if field has `autocomplete="family-name"` or `autocomplete="given-name"` or `autocomplete="name"`

If `<label>` contains "birth" (or "naissance" en français), Safari will autofill as if field has `autocomplete="bday"` (birth day).

If `<label>` contains "Name" (or "Nom" en français), Safari will autofill as if field has `autocomplete="family-name"` or `autocomplete="name"`


* for firstname/lastname, you should use the specific `autocomplete` value
* for birthname... no good solution:
  * `<input autocomplete="off">` does not work 😭
  * either ensure the `<label>` does not contain with "Name" or "birth" 🤪
  * or use a mostly unused `autocomplete` value, for example `autocomplete="url"`
  * or put `&zwnj;` ("zero width non-joiner") inside the `<label>` words (but beware of `placeholder`s too, and screen readers spell the words...)
  * or use `autocomplete="family-name"`, which can be wrong, but not too bad

Ref: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill https://stackoverflow.com/questions/15738259/disabling-chrome-autofill/30976223 https://stackoverflow.com/questions/43058018/how-to-disable-autocomplete-in-address-fields-for-safari

# Tests

* [html test file](test.html)
* Chromium test : [screenshot](test-chromium.png)
* Firefox test : [screenshot](test-firefox.png)
* Safari test : [screenshot](test-safari.png)