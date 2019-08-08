# Dashboard

Dashboard is a NodeJS project that provides a reusable account management system for web applications. 

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.

Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

- [Developer documentation home](https://userdashboard.github.io/developers/)
- [Administrator documentation home](https://userdashboard.github.io/administrators/)
- [User documentation home](https://userdashboard.github.io/users/)

### Case studies 

`Hastebin` is an open source pastebin web application.  It started as a service for anonymous guests only, and was transformed with Dashboard and modules into a web application for registered users, with support for sharing posts with organizations and paid subscriptions.

- [Hastebin - free web application](https://userdashboard.github.io/integrations/hastebin-free-saas.html)
- [Hastebin - subscription web application](https://userdashboard.github.io/integrations/hastebin-saas-subscription.html)

## Screenshots of Dashboard

The user and administration documentation contain screenshots demonstrating Dashboard and its modules in use. 

| ![Guest landing page](https://userdashboard.github.io/developers/integrations/hastebin-subscription-saas/1-index-page.png?raw=true) | 
|:---------------------------------------------------------------------------------------------------------------:|
| Example app integrating Dashboard with `/` served by its application server |

| ![Administration page](https://userdashboard.github.io/developers/integrations/hastebin-subscription-saas/3-owner-views-subscription-administration.png?raw=true) |
|:---------------------------------------------------------------------------------------------------------------:|
| Administration page provided by Dashboard |

| ![Example app integrating Dashboard ](https://userdashboard.github.io/developers/integrations/hastebin-subscription-saas/14-second-user-creates-shared-post.png?raw=true) |
|:---------------------------------------------------------------------------------------------------------------:|
| Example app integrating Dashboard with `/home` served by its application server |

## Dashboard storage

You can use Dashboard with your local file system or other storage backends with various pros and cons.  The storage may apply AES-256 encryption by specifying a 32-character encryption secret:

    ENCRYPTION_KEY="abcdefghijklmnopqrstuvwxyz123456"

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| Redis | Very fast but expensive to scale | [@userdashboard/storage-redis](https://npmjs.com/package/@userdashboard/storage-redis) | [github](https://github.com/userdashboard/storage-edis) |
| Amazon S3 | Slow but cheap to scale | [@userdashboard/storage-s3](https://npmjs.com/package/@userdashboard/storage-s3) | [github](https://github.com/userdashboard/storage-s3) |
| PostgreSQL | Fast but not cheap to scale | [@userdashboard/storage-postgresql](https://npmjs.com/package/@userdashboard/storage-postgresql) | [github](https://github.com/userdashboard/storage-postgresql) |

You can code your own alternatives for other databases by copying the Storage API's basic operations to read, write and list data.

## Dashboard modules

Additional APIs, content and functionality can be added by `npm install` and nominating Dashboard modules in your `package.json`.  You can read more about this on the [Dashboard package.json documentation](https://userdashboard.github.io/developers/dashboard-package-json.html)

    "dashboard": {
      "modules": [ "package", "package2" ]
    }

Modules can supplement the global.sitemap with additional routes which automatically maps them into the `Private API` shared as global.api.

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| MaxMind GeoIP | IP address-based geolocation | [@userdashboard/maxmind-geoip](https://npmjs.com/package/userdashboard/maxmind-geoip)| [github](https://github.com/userdashboard/maxmind-geoip) |
| Organizations | User created groups | [@userdashboard/organizations](https://npmjs.com/package/userdashboard/organizations) | [github](https://github.com/userdashboard/organizations) |
| Stripe Subscriptions | SaaS functionality | [@userdashboard/stripe-subscriptions](https://npmjs.com/package/userdashboard/stripe-subscriptions) | [github](https://github.com/userdashboard/stripe-subscriptions) |
| Stripe Connect | Marketplace functionality | [@userdashboard/stripe-connect](https://npmjs.com/package/userdashboard/stripe-connect) | [github](https://github.com/userdashboard/stripe-connect)

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

If you are using NodeJS and Express or Connect for your web server the [Express Application Server middleware](https://github.com/userdashboard/express-application-server) will do this for you.

## Privacy

Dashboard accounts optionally support anonymous registration and irreversibly encrypt signin username and passwords.  There are no third-party trackers, analytics or resources embedded in Dashboard pages.  

#### Development

Development takes place on [Github](https://github.com/userdashboard/dashboard) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/dashboard).

#### License

This software is distributed under the MIT license.