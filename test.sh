if [ ! -d node_modules/puppeteer ]; then
  npm install puppeteer --no-save
fi
PARAMS=""
if [ ! -z "$1" ]; then
  PARAMS="$PARAMS -- --grep $1"
fi
FAST_START=true \
DASHBOARD_SERVER="http://localhost:9007" \
DOMAIN="localhost" \
PORT=9007 \
STORAGE_PATH=/tmp/test-data \
ENCRYPTION_SECRET=12345678901234567890123456789012 \
ENCRYPTION_SECRET_IV=1234123412341234 \
GENERATE_SITEMAP_TXT=false \
GENERATE_API_TXT=false \
npm test $PARAMS