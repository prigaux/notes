Les différents outils (htop/free/...) utilisent /proc/meminfo comme source de données. [ref](https://access.redhat.com/solutions/406773)

htop ([ref](https://github.com/hishamhm/htop/blob/master/linux/LinuxProcessList.c#L918)) calcule des choses intéressantes, mais n'utilise pas MemAvailable :
* buffer = Buffers
* cache = Cached - Shmem + SReclaimable
* used total = MemTotal - MemFree

zabbix ([ref](https://www.zabbix.com/documentation/4.0/manual/appendix/items/vm.memory.size_params))
* Buffered memory = Buffers
* Cached memory = Cached
  !! attention Shmem est compté dedans !!
* Available memory = MemAvailable ([ref](https://support.zabbix.com/browse/ZBX-9142), [ref](https://github.com/zabbix/zabbix/blob/trunk/src/libs/zbxsysinfo/linux/memory.c#L121))
  * disponible depuis le kernel linux 3.14
    ([définition de "MemAvailable"](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=34e431b0ae398fc54ea69ff85ec700722c9da773))
  * c'est assez fiable, sauf si MemAvailable n'est pas dispo où zabbix prend MemFree + Buffers + Cached, et inclus donc la mémoire SHM comme mémoire disponible
* Used memory = MemberTotal - MemFree
* Real used memory = ?? cela semble proche de "MemTotal - MemAvailable" mais je n'ai pas trouvé la définition
=> le graph actuel dans zabbix semble superposer RealUsed+Buffered+Cached+Free, alors que Shmem est compté à la fois dans RealUsed et dans Cached. Cela ne semble pas troubler le graph (???) mais quand on regarde la légende, ça fait bizarre (le jaune est tout petit sur le graph alors que la légende dit 11G)

free fait aussi la confusion :
* shared = Shmem
  => mémoire partagée entre processus (ramdisks, SHM...), c'est de la mémoire non libérable
* used = MemTotal - MemFree - Buffers - Cached - Slab
  => prendre used + shared pour avoir une idée de l'occupation mémoire
* les versions récentes de free affichent MemAvailable
* buff/cache = Cached + Buffers + Slab
  !! attention Shmem est compté dedans, donc Shmem apparait à la fois dans "shared" et dans "buff/cache" !!

Dans le cas oracle, comme pour java, monitorer le système est difficile car la mémoire est gérée en interne.
Il faut monitorer directement l'utilisation mémoire par l'appli (comme fait pour java, tomcat, elasticsearch...)
