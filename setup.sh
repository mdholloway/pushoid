set -euo pipefail

cqlsh -e "CREATE KEYSPACE IF NOT EXISTS pushoid WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 1 };"
cqlsh -e "CREATE TABLE IF NOT EXISTS pushoid.subscriptions ( uuid uuid, provider_token text, protocol text, created timestamp, updated timestamp, lang text, badge tinyint, PRIMARY KEY (uuid) );"
