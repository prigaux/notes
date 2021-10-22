Java WatchService API is useful to monitor a directory for changes. It works nicely to detect deleted files. But for modification, you often get multiple [ENTRY_MODIFY](https://docs.oracle.com/javase/8/docs/api/java/nio/file/StandardWatchEventKinds.html) events.
Hence users neeeding [workarounds](https://stackoverflow.com/questions/16777869/java-7-watchservice-ignoring-multiple-occurrences-of-the-same-event) 😢
... or [giving up on WatchService and using another library](http://surajatreyac.github.io/2014-07-29/reactive_file_handling.html) which uses inotify event "CLOSE_WRITE" (on Linux)

