# Dashboard

Dashboard is a NodeJS project that provides a reusable account management system for web applications. 

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.

Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

- [Dashboard Wiki](https://github.com/userdashboard/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userdashboard/dashboard/wiki/Configuring-Dashboard)
- [Dashboard code structure](https://github.com/userdashboard/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userdashboard/dashboard/wiki/Server-Request-Lifecycle)
- [API access from application server](https://github.com/userdashboard/dashboard/wiki/API-access-from-application-server)
- [API access from module](https://github.com/userdashboard/dashboard/wiki/API-access-from-module)
- [API access from web browser](https://github.com/userdashboard/dashboard/wiki/API-access-from-web-browser)
- [Creating web applications with Dashboard](https://github.com/userdashboard/dashboard/wiki/Creating-web-applications-with-Dashboard)
- [Integrating Dashboard with existing web applications](https://github.com/userdashboard/dashboard/wiki/Integrating-Dashboard-with-existing-web-applications)
- [Creating modules for Dashboard](https://github.com/userdashboard/dashboard/wiki/Creating-modules-for-Dashboard)

### Case studies 

`Hastebin` is an open source pastebin web application.  It started as a service for anonymous guests only, and was transformed with Dashboard and modules into a web application for registered users, with support for sharing posts with organizations and paid subscriptions.

- [Hastebin - free web application](https://github.com/userdashboard/integration-examples/blob/master/hastebin/hastebin-saas-free.md)
- [Hastebin - subscription web application](https://github.com/userdashboard/integration-examples/blob/master/hastebin/hastebin-saas-subscription.md)

## Dashboard storage

You can use Dashboard with your local file system or other storage backends with various pros and cons.  The storage may apply AES-256 encryption by specifying a 32-character encryption secret:

    ENCRYPTION_KEY="abcdefghijklmnopqrstuvwxyz123456"

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| Redis | Very fast but expensive to scale | @userdashboard/storage-redis | [github](https://github.com/userdashboard/storage-edis) |
| Amazon S3 | Slow but cheap to scale | @userdashboard/storage-s3 | [github](https://github.com/userdashboard/storage-s3) |
| PostgreSQL | Fast but not cheap to scale | @userdashboard/storage-postgreqsl | [github](https://github.com/userdashboard/storage-postgresql) |

You can code your own alternatives for other databases by copying the Storage API's basic operations to read, write and list data.

## Dashboard modules

Additional APIs, content and functionality can be added by `npm install` and nominating Dashboard modules in your `package.json`.  You can read more about this on the [Dashboard configuration wiki page](https://github.com/userdashboard/dashboard/wiki/Configuring-Dashboard)

    "dashboard": {
      "modules": [ "package", "package2" ]
    }

Modules can supplement the global.sitemap with additional routes which automatically maps them into the `Private API` shared as global.api.

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| MaxMind GeoIP | IP address-based geolocation | @userdashboard/maxmind-geoip | [github](https://github.com/userdashboard/maxmind-geoip) |
| Organizations | User created groups | @userdashboard/organizations | [github](https://github.com/userdashboard/organizations) |
| Stripe Subscriptions | SaaS functionality | @userdashboard/stripe-subscriptions | [github](https://github.com/userdashboard/stripe-subscriptions) |
| Stripe Connect | Marketplace functionality | @userdashboard/stripe-connect | [github](https://github.com/userdashboard/stripe-connect)

### Setting up the dashboard server

You must install [NodeJS](https://nodejs.org) 8.12.0+ prior to these steps.  Dashboard is installed via NPM which is bundled with NodeJS.  It is installed within the `node_modules/@userdashboard/dashboard` folder.  You can configure Dashboard within your package.json and start script.

    $ mkdir project
    $ cd project
    $ npm init
    $ npm install @userdashboard/dashboard
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
    
    const dashboard = require('@userdashboard/dashboard')
    dashboard.start(__dirname)

Your sitemap will output the server address, by default you can access it at:

    http://localhost:8000

### Your application server

Your application can server can be written using your preferred technology stack.  When your server receives a request from your Dashboard server it includes identifiers for the user and session.

Requests can be verified via the APPLICATION_SERVER_TOKEN.  This is a shared secret known by both the Dashboard and your application server.  This token and account/session identifiers allow you to query the Dashboard server's API for additional information.

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

If you are using NodeJS and Express or Connect for your web server the [Express Application Server middleware]() will do this for you.

## Privacy

Dashboard accounts optionally support anonymous registration and irreversibly encrypt signin username and passwords.  There are no third-party trackers, analytics or resources embedded in Dashboard pages.  

#### Development

Development takes place on [Github](https://github.com/userdashboard/dashboard) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/dashboard).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.