# editing "git rebase -i" files

https://github.com/MitMaro/git-interactive-rebase-tool/ and https://github.com/sjurba/rebase-editor are quite interesting.

vim is quite nice too. Here is a few conf that gives you something alike the tools above :-)

* cat ~/.vimrc

```
" move one line up/down
nnoremap <A-Up> :m-2<CR>
nnoremap <A-Down> :m+<CR>
" move lines up/down (in "V"isual mode)
vnoremap <A-Up>   :m '<-2<CR>gv=gv
vnoremap <A-Down> :m '>+1<CR>gv=gv
```

* cat ~/.vim/after/ftplugin/gitrebase.vim

```
function Gitrebase_show_commit()
     :execute "silent ! git show --color " . getline(".")[5:12] . " | less -SR"
     :redraw!
endfunction

nnoremap <buffer> <silent> c :call Gitrebase_show_commit()<CR>
nnoremap <buffer> <silent> f :Fixup<CR>
```
