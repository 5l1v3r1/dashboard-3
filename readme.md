# Dashboard

Dashboard is a NodeJS project that provides a reusable account management system for web applications. 

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.

Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

Dashboard and official modules are completely API-driven.  The API is accessible to your application server and can be configured to allow public access.

Dashboard content functions without clientside JavaScript.  It can be overriden with your own content or styling or you may use the APIs 

### Demonstrations

- [Dashboard](https://dashboard-demo-2344.herokuapp.com)
- [Dashboard + Organizations module](https://organizations-demo-7933.herokuapp.com)
- [Dashboard + Stripe Subscriptions module](https://stripe-subscriptions-5701.herokuapp.com)
- [Dashboard + Stripe Connect module](https://stripe-connect-8509.herokuapp.com)

### App Stores

Application servers written for Dashboard can be published on websites running our [app store](https://github.com/userappstore/app-store-dashboard-server) software like [UserAppStore](https://userappstore.com).

#### Documentation
- [Introduction](https://github.com/userappstore/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userappstore/dashboard/wiki/Configuring-Dashboard)
- [Contributing to Dashboard](https://github.com/userappstore/dashboard/wiki/Contributing-to-Dashboard)
- [Dashboard code structure](https://github.com/userappstore/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userappstore/dashboard/wiki/Server-Request-Lifecycle)

#### Development

Development takes place on [Github](https://github.com/userappstore).  Releases, documentation and issues are hosted on [Github](https://github.com/userappstore) and [NPM](https://www.npmjs.com/package/@userappstore/dashboard).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.

## Installation

You must install [NodeJS](https://nodejs.org) 8.12.0+ prior to these steps.

### Setting up the dashboard server

Dashboard is installed via NPM which is bundled with NodeJS.  It is installed within the `node_modules/@userappstore/dashboard` folder.  You can configure Dashboard within your package.json and start script.


    $ mkdir project
    $ cd project
    $ npm init
    $ npm install @userappstore/dashboard --only=production
    # create a main.js
    # create a src/www/index.html to override home page
    # create a src/www/account/register.html to override register page
    $ NODE_ENV="development" \
      DASHBOARD_SERVER=http://localhost:8000 \
      APPLICATION_SERVER=http://localhost:8001 \
      APPLICATION_SERVER_TOKEN="abcdef" \
      DOMAIN=localhost \
      node main.js

Your `main.js` should contain the code to start Dashboard:
    
    const dashboard = require('@userappstore/dashboard')
    dashboard.start(__dirname)

Your sitemap will output the server address, by default you can access it at:

    http://localhost:8000

### Your application server

Your application can server can be written using your preferred technology stack.  When your server receives a request from your Dashboard server it includes identifiers for the user and session.

Requests can be verified via the APPLICATION_SERVER_TOKEN.  This is a shared secret known by both the Dashboard and your application server.  This token and account/session identifiers allow you to query the Dashboard server's API for additional information.

The request headers will 

    if (req.headers['x-dashboard-server'] === MY_DASHBOARD_SERVER)
      if (req.headers['x-accountid']) {
        const accountid = req.headers['x-accountid']
        const sessionid = req.headers['x-sessionid']
        if (!bcrypt.compareSync(`${APPLICATION_SERVER_TOKEN}/${accountid'}/${sessionid}`, req.headers['x-dashboard-token'])) {
          res.statusCode = 404
          return res.end()
        }
      }
    }

### The sitemap.txt file

Each time Dashboard starts it generates a sitemap of all the URLs it has found combining itself with any additional modules or content added to the Dashboard server.

### The tests.txt file

This software has a test suite located alongside each NodeJS file in a `.test.js` file.  The tests run using `mocha`.  Prior to release the completed, successful test suite output is written to `tests.txt`.

    $ npm install mocha -g
    $ npm test

## Dashboard storage

You can use Dashboard with your local file system or other storage backends with various pros and cons.  The storage may encrypts data with AES-256 encryption by specifying a 32-character encryption secret:

    ENCRYPTION_KEY="abcdefghijklmnopqrstuvwxyz123456"

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| Redis | Very fast but expensive to scale | @dashboard/storage-redis | [github](https://github.com/userappstore/storage-edis) |
| Amazon S3 | Slow but cheap to scale | @dashboard/storage-s3 | [github](https://github.com/userappstore/storage-s3) |
| PostgreSQL | Fast but not cheap to scale | @dashboard/storage-postgreqsl | [github](https://github.com/userappstore/storage-postgresql) |

You can code your own alternatives for other databases by mimicking the Storage API's basic operations to read, write and list data.


## Dashboard modules

Additional APIs, content and functionality can be added by `npm install` and nominating Dashboard modules in your `package.json`.  You can read more about this on the [Dashboard configuration wiki page](https://github.com/userappstore/dashboard/wiki/Configuring-Dashboard)

    "dashboard": {
      "modules": [ "package", "package2" ]
    }

Modules can supplement the global.sitemap with additional routes which automatically maps them into the `Private API` shared as global.api.

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| MaxMind GeoIP | IP address-based geolocation | @dashboard/maxmind-geoip | [github](https://github.com/userappstore/maxmind-geoip) |
| Organizations | User created groups | @dashboard/organizations | [github](https://github.com/userappstore/organizations) |
| Stripe Subscriptions | SaaS functionality | @dashboard/stripe-subscriptions | [github](https://github.com/userappstore/stripe-subscriptions) |
| Stripe Connect | Marketplace functionality | @dashboard/stripe-connect | [github](https://github.com/userappstore/stripe-connect)

## Privacy

Dashboard accounts can require no personal information from the user and irreversibly encrypts signin usernames so they cannot be used for anything else.  There are no third-party trackers, analytics or resources embedded in Dashboard pages.

