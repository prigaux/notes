`git diff --color-words` is really nice. Even better is:

```bash
git diff --color-words='[[:alnum:]]+|[^[:space:]]'
```

And you really wish you could use it outside git!

Easy:

```
git diff --no-index /tmp/a /tmp/b
```

On this subject, see also https://framagit.org/prigaux/scripts/-/blob/master/gdiff and https://framagit.org/prigaux/scripts/-/blob/master/gdiff-filtered