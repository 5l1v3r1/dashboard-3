# Dashboard

Dashboard is a NodeJS project that provides a user account system and administration tools for web applications.  A traditional web application has a tailor-made user login and management system often grievously lacking in functionality that will be added later, or forfeits very priviliged information to Google and Facebook.  When you use Dashboard you start with a complete UI for your users and administrators to manage the beaurocacy of web apps. 

You can use your preferred language, database and tools to write your application with Dashboard hosted seperately.  Dashboard will proxy your content as the user requests it, and your server can access Dashboard's comprehensive API to retrieve account-related data.

NodeJS developers may embed Dashboard as a module `@userappstore/dashboard` and share the hosting, or host Dashboard seperately too.

### Demonstrations

- [Dashboard](https://dashboard-demo-2344.herokuapp.com)
- [Dashboard + Organizations module](https://organizations-demo-7933.herokuapp.com)
- [Dashboard + Stripe Subscriptions module](https://stripe-subscriptions-5701.herokuapp.com)
- [Dashboard + Stripe Connect module](https://stripe-connect-8509.herokuapp.com)

### UserAppStore

If you are building a SaaS with Dashboard consider publishing it on [UserAppStore](https://userappstore.com), an app store for subscriptions.   UserAppStore is powered by Dashboard and open source too.

#### Documentation
- [Introduction](https://github.com/userappstore/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userappstore/dashboard/wiki/Configuring-Dashboard)
- [Contributing to Dashboard](https://github.com/userappstore/dashboard/wiki/Contributing-to-Dashboard)
- [Dashboard code structure](https://github.com/userappstore/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userappstore/dashboard/wiki/Server-Request-Lifecycle)

#### Development

Development takes place on [Gitlab](https://gitlab.com/userappstore).  Releases, documentation and issues are hosted on [Github](https://github.com/userappstore).  Releases are also published on [NPM](https://www.npmjs.com/package/@userappstore/dashboard).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.

## Installation

You must install [Redis](https://redis.io) and [NodeJS](https://nodejs.org) 8.1.4+ prior to these steps.

### Dashboard server

The first account to register will be the owner and an administrator.

    $ git clone https://github.com/userappstore/dashboard
    $ cd dashboard
    $ npm install --only=production
    $ NODE_ENV="development" \
      DASHBOARD_SERVER=http://localhost:8000 \
      APPLICATION_SERVER=http://localhost:8001 \
      APPLICATION_SERVER_TOKEN="abcdef" \
      DOMAIN=localhost \
      node main.js

### Application server

The APPLICATION_SERVER_TOKEN is used to verify API requests to the Dashboard server came from your application server and vice-versa:

    if (req.headers['x-dashboard-server'] === 'http://my-dashboard')
      if (req.headers['x-accountid']) {
        const accountid = req.headers['x-accountid']
        const sessionid = req.headers['x-sessionid']
        if (!bcrypt.compareSync(`abcdef:${accountid'}/${sessionid}`, req.headers['x-dashboard-token'])) {
          res.statusCode = 404
          return res.end()
        }
      } else {
        // anonymous request
      }
    }

### NodeJS module

    $ mkdir project
    $ cd project
    $ npm init
    $ npm install @userappstore/dashboard --only=production
    # create a main.js
    $ node main.js

Your `main.js` should contain the code to start Dashboard:
    
    const dashboard = require('@userappstore/dashboard')
    dashboard.start(__dirname)

Your sitemap will output the server address, by default you can access it at:

    http://localhost:8000

### The sitemap.txt file

Each time Dashboard starts it unifies the `src/www` of itself, modules being imported and your own NodeJS additions if any.  All URLs and configuration is written to `sitemap.txt`.

### The tests.txt file

This software has a test suite located alongside each NodeJS file in a `.test.js` file.  The tests run using `mocha`.  Prior to release the completed, successful test suite output is written to `tests.txt`.

    $ npm install mocha -g
    $ npm test

## Application server

Dashboard covers your user accounts, the application you write can share the same server and NodeJS process or be a completely separate piece of software in any language on any platform.  

If your application runs with Dashboard in NodeJS you can [add content directly](https://github.com/userappstore/dashboard/wiki/Creating-Dashboard-content) to your `/src/www` and it will be included in your sitemap automatically.

If your application is hosted somewhere Dashboard will proxy your server and serve the responsest:

    process.env.APPLICATION_SERVER = "http://localhost:1234"
    process.env.APPLICATION_SERVER_TOKEN = "A shared secret"

When your application server receives a request information is included in the headers to identify the user and session.  Your application server can access Dashboard's private APIs on behalf of that user.

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

Dashboard accounts requires no personal information from the user and irreversibly encrypts signin usernames so they cannot be used for anything else.  There are no third-party trackers, analytics or other content in Dashboard pages.

## Security

Dashboard encrypts all usernames with a fixed-salt bcrypt hash.  The reason for using a fixed hash is to ensure the same output every time so the hashed username remains a unique identifier.  Passwords are encrypted with a random-salt bcrypt hash.

    process.env.BCRYPT_FIXED_SALT = "$2a$10....."
    process.env.BCRYPT_WORKLOAD_FACTOR = "11"
    process.env.MINIMUM_USERNAME_LENGTH = "10"
    process.env.MAXIMUM_USERNAME_LENGTH = "100"
    process.env.MINIMUM_PASSWORD_LENGTH = "10"
    process.env.MAXIMUM_PASSWORD_LENGTH = "100"
    process.env.MINIMUM_RESET_CODE_LENGTH = "10"
    process.env.MINIMUM_RESET_CODE_LENGTH = "100"

The database encrypts keys and string values with AES-256 encryption and a random IV or a shared IV depending on whether a consistent string is required.  This transparently overrides most Redis operations.

    process.env.REDIS_ENCRYPTION_SECRET = "this is my encryption key and it can be as long as I want"

## Account security

Deleting accounts is done on a schedule allowing time for the user or administrator to cancel the process.  Administrators can delete accounts any time including scheduled accounts after the time passes.

    process.env.DELETE_DELAY = 7 # days

Account modifications locks the session to the current URL, binds any POST data to the session and then requires the user authenticates.  

The user may 'remember' the authentication if they anticipate performing many locked operations so they don't have to authenticate each time.  After authentication the user is redirected back and the authorized operation is completed, when it is not necessary the operation is completed immediately.

