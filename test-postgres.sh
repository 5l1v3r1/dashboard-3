NODE_ENV=testing \
SILENT_START=true \
PAGE_SIZE=3 \
DASHBOARD_SERVER="http://localhost:9002" \
PORT=9002 \
STORAGE_ENGINE="@userappstore/storage-postgresql" \
DATABASE_URL=postgres://postgres:docker@localhost:5432/postgres \
npm test