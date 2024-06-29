# VS Bash Runner

VS Bash Runner is a Visual Studio Code extension that allows users to see the output of bash commands in the status bar.

## Example Commands

You can add your commands in the `settings.json` file of your VS Code like this:

<div style="overflow-x: scroll; white-space: nowrap;">

```json
"vs-bash-runner.bashCommands": {
  "CPU": "mpstat -P ALL | awk '/all/ {printf(\"%.2f\\n\", $13);}'",
  "MEM": "free -mh | awk '/Mem:/ {printf(\"%s\\n\", $4);}'",
  "NET": "/bin/bash -c 'init_rx=$(grep eth0 /proc/net/dev | awk \"{print \\$2}\"); init_tx=$(grep eth0 /proc/net/dev | awk \"{print \\$10}\"); sleep 1; end_rx=$(grep eth0 /proc/net/dev | awk \"{print \\$2}\"); end_tx=$(grep eth0 /proc/net/dev | awk \"{print \\$10}\"); rx=$((end_rx-init_rx)); tx=$((end_tx-init_tx)); printf \"↓ %.3fKB/s \" $(bc <<< \"scale=2; $rx/1024\"); printf \" ↑ %.3fKB/s\\n\" $(bc <<< \"scale=2; $tx/1024\")'",
  "DATA": "cat /proc/net/dev | awk '/eth0/ {printf(\"%.3fGB\\n\", ($10+$2)/(1024*1024*1024));}'",
  "DISK": "df -h | awk '/\\/workspace/ {printf(\"%s\\n\", $4);}'",
}
```

</div>

