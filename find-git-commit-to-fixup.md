# git alias to help finding the git commit to `fixup`

`git add -p` and `git fixup` are great. But finding the commit to fixup could be somewhat automated:
* get the first staged modified line
* find the latest commit which modified this line

```ini
[alias]
    commit-modifying-cached-change = !perl -le '($prev) = `git diff --cached` =~ /^- (.*)/m and print qq(- ), $prev and print q() and system qw(git log -p --max-count=1 -S), $prev'
```
 
=> `git commit-modifying-cached-change` will show the most probable commit to fixup. You just need to copy/past the SHA to `git commit --fixup=`


NB: I had issues with double quotes hence the use of perl `q(...)`
