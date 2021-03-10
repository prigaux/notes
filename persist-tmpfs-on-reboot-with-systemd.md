## Persist tmpfs on reboot (using systemd)

### Context

* writing sessions to disk can be waste of I/O
* using tmpfs is an easy solution
* but you loose the sessions on reboot

For planned reboot:
* quick'n'dirty solution : save sessions, reboot, restore sessions  
  => the time you log again to restore sessions, some users will get logged out
* a little more complex solution: stop & disable http server, save sessions, reboot, restore sessions, enable & start http server  
  => tedious and slows down the availability

### Solution

Here is a small solution which handles the restoration of tmpfs:
* you explicitly call the script to save tmpfs
* before the service starts, systemd will call the script to restore tmpfs

So to reboot, call 
```sh
/root/tmpfs-save-restore-all save && reboot
```

### Files

NB: you need to adapt `dirs` and `apache2.service.d` to your own needs.

* /root/tmpfs-save-restore-all
```sh
#!/bin/sh

dirs="/var/lib/php/sessions"
backup_dir=/var/backups/tmpfs-save-restore/

action=$1

usage() { echo "tmpfs-save-restore-all save|restore"; exit 1; }

if [ ! -d "$backup_dir" ]; then
   echo "you must create ''$backup_dir'' first"
   exit 1
fi

for dir in $dirs; do
  backup_file=$backup_dir/`basename $dir`.tar.gz
  [ -d $dir ] || { echo "invalid dir ''$dir''"; exit 1; }
  cd $dir
  if [ "$action" = "save" ]; then
    tar cfz $backup_file .
  elif [ "$action" = "restore" ]; then
    if [ -e $backup_file ]; then
      tar xf $backup_file
      rm -f $backup_file
    fi
  else
    usage
  fi
done
```

* /etc/systemd/system/apache2.service.d/tmpfs-save-restore-all.conf
```ini
[Service]
ExecStartPre=/root/tmpfs-save-restore-all restore
```

### Similar solutions

The following solutions can be useful, but can be too complex

* https://thelinuxexperiment.com/persistent-ramdisk-on-debain-ubuntu/
* https://github.com/graysky2/anything-sync-daemon
* https://forum.odroid.com/viewtopic.php?t=23730
