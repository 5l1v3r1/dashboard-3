NODE_ENV=testing \
FAST_START=true \
PAGE_SIZE=3 \
DASHBOARD_SERVER="http://localhost:9002" \
PORT=9002 \
STORAGE_ENGINE="@userdashboard/storage-postgresql" \
DATABASE_URL=postgres://postgres:docker@localhost:5432/postgres \
npm test