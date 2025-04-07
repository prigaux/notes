# Port based IP routing on Linux

## Use cases
By default openconnect (via vpnc-script) or pulsesecure will route all IPs listed in its configuration. Useful for ssh if VPN is required, but it will also tunnel https or imaps, even if it is not needed.
Stopping the VPN will break imap connexions established via VPN. TCP will detect it... 15 minutes later :'-(

Solution : only force ssh trafic through VPN, using "policy routing". Very simple!

## Explained

First create ip rules, for example:
```
ip rule add dport 22 table 22
ip rule add dport 443 table 443
```

Then you can do
```
ip route replace 193.55.96.0/21 dev tun0 table 22
```
and only ssh requests will go through "tun0".

To see those routes, I suggest:
```
ip route show table all dev tun0 scope link
```
(ie all routes on all tables on "tun0", with scope "link")
