command=
"/bin/bash -c 'init_rx=\$(grep eth0 /proc/net/dev | awk \"{print \\\$2}\"); init_tx=\$(grep eth0 /proc/net/dev | awk \"{print \\\$10}\"); sleep 1; end_rx=\$(grep eth0 /proc/net/dev | awk \"{print \\\$2}\"); end_tx=\$(grep eth0 /proc/net/dev | awk \"{print \\\$10}\"); rx=\$((end_rx-init_rx)); tx=\$((end_tx-init_tx)); printf \"↓ %.3fKB/s \" \$(bc <<< \"scale=2; \$rx/1024\"); printf \" ↑ %.3fKB/s\\n\" \$(bc <<< \"scale=2; \$tx/1024\")'"

eval $command