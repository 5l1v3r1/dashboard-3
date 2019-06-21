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
- [Dashboard code structure](https://github.com/userappstore/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userappstore/dashboard/wiki/Server-Request-Lifecycle)

### Setting up the dashboard server

You must install [NodeJS](https://nodejs.org) 8.12.0+ prior to these steps.  Dashboard is installed via NPM which is bundled with NodeJS.  It is installed within the `node_modules/@userappstore/dashboard` folder.  You can configure Dashboard within your package.json and start script.

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

## Access user information from your application server

| URL                                               | Method | Querystring  | POST data  |
|---------------------------------------------------|--------|--------------|------------|
| /api/administrator/account                        | GET    | accountid=   |            |
| /api/administrator/account-profiles               | GET    | accountid=   |            |
| /api/administrator/account-profiles-count         | GET    | accountid=   |            |
| /api/administrator/account-reset-codes            | GET    | accountid=   |            |
| /api/administrator/account-reset-codes-count      | GET    | accountid=   |            |
| /api/administrator/account-sessions               | GET    | accountid=   |            |
| /api/administrator/account-sessions-count         | GET    | accountid=   |            |
| /api/administrator/accounts                       | GET    |              |            |
| /api/administrator/accounts-count                 | GET    |              |            |
| /api/administrator/administrator-accounts         | GET    |              |            |
| /api/administrator/administrator-accounts-count   | GET    |              |            |
| /api/administrator/create-reset-code              | POST   | accountid=   |            |
| /api/administrator/delete-account                 | DELETE | accountid=   |            |
| /api/administrator/deleted-accounts               | GET    |              |            |
| /api/administrator/deleted-accounts-count         | GET    |              |            |
| /api/administrator/profile                        | GET    | profileid=   |            |
| /api/administrator/profiles                       | GET    |              |            |
| /api/administrator/profiles-count                 | GET    |              |            |
| /api/administrator/reset-account-administrator    | PATCH  | accountid=   |            |
| /api/administrator/reset-code                     | GET    | codeid=      |            |
| /api/administrator/reset-codes                    | GET    |              |            |
| /api/administrator/reset-codes-count              | GET    |              |            |
| /api/administrator/reset-session-key              | PATCH  | accountid=   |            |
| /api/administrator/session                        | GET    | sessionid=   |            |
| /api/administrator/sessions                       | GET    |              |            |
| /api/administrator/sessions-count                 | GET    |              |            |
| /api/administrator/set-account-administrator      | PATCH  | accountid=   |            |
| /api/administrator/set-account-deleted            | PATCH  | accountid=   |            |
| /api/administrator/set-owner-account              | PATCH  | accountid=   |            |
| /api/user/account                                 | GET    | accountid=   |            |
| /api/user/create-account                          | POST   |              |            |
| /api/user/create-profile                          | POST   | accountid=   |            |
| /api/user/create-reset-code                       | POST   | accountid=   |            |
| /api/user/create-session                          | POST   | accountid=   |            |
| /api/user/delete-profile                          | DELETE | profileid=   |            |
| /api/user/delete-reset-code                       | DELETE | codeid=      |            |
| /api/user/profile                                 | GET    | profileid=   |            |
| /api/user/profiles                                | GET    | accountid=   |            |
| /api/user/profiles-count                          | GET    | accountid=   |            |
| /api/user/reset-account-deleted                   | PATCH  | accountid=   |            |
| /api/user/reset-account-password                  | PATCH  | accountid=   |            |
| /api/user/reset-code                              | GET    | codeid=      |            |
| /api/user/reset-codes                             | GET    | accountid=   |            |
| /api/user/reset-codes-count                       | GET    | accountid=   |            |
| /api/user/reset-session-key                       | PATCH  | sessionid=   |            |
| /api/user/reset-session-unlocked                  | PATCH  | sessionid=   |            |
| /api/user/session                                 | GET    | sessionid=   |            |
| /api/user/sessions                                | GET    | accountid=   |            |
| /api/user/sessions-count                          | GET    | accountid=   |            |
| /api/user/set-account-deleted                     | PATCH  | accountid=   |            |
| /api/user/set-account-password                    | PATCH  | accountid=   |            |
| /api/user/set-account-profile                     | PATCH  | accountid=   |            |
| /api/user/set-account-username                    | PATCH  | accountid=   |            |
| /api/user/set-session-ended                       | PATCH  | sessionid=   |            |
| /api/user/set-session-unlocked                    | PATCH  | sessionid=   |            |
| /api/user/update-profile                          | PATCH  | profileid=   |            |

## Access geoip information from the dashboard server

| Method                                             | Querystring  | POST data  |
|----------------------------------------------------|--------------|------------|
| global.api.Administrator.Account.get(req)                      | accountid=   |            |
| global.api.Administrator.AccountProfiles.get(req)              | accountid=   |            |
| global.api.Administrator.AccountProfilesCount.get(req)         | accountid=   |            |
| global.api.Administrator.AccountResetCodes.get(req)            | accountid=   |            |
| global.api.Administrator.AccountResetCodesCount.get(req)       | accountid=   |            |
| global.api.Administrator.AccountSessions.get(req)              | accountid=   |            |
| global.api.Administrator.AccountSessionsCount.get(req)         | accountid=   |            |
| global.api.Administrator.Accounts.get(req)                     |              |            |
| global.api.Administrator.AccountsCount.get(req)                |              |            |
| global.api.Administrator.AdministratorAccounts.get(req)        |              |            |
| global.api.Administrator.AdministratorAccountsCount.get(req)   |              |            |
| global.api.Administrator.CreateResetCode.post(req)             | accountid=   |            |
| global.api.Administrator.DeleteAccount.delete(req)             | accountid=   |            |
| global.api.Administrator.DeletedAccounts.get(req)              |              |            |
| global.api.Administrator.DeletedAccountsCount.get(req)         |              |            |
| global.api.Administrator.Profile.get(req)                      | profileid=   |            |
| global.api.Administrator.Profiles.get(req)                     |              |            |
| global.api.Administrator.ProfilesCount.get(req)                |              |            |
| global.api.Administrator.ResetAccountAdministrator.patch(req)  | accountid=   |            |
| global.api.Administrator.ResetCode.get(req)                    | codeid=      |            |
| global.api.Administrator.ResetCodes.get(req)                   |              |            |
| global.api.Administrator.ResetCodesCount.get(req)              |              |            |
| global.api.Administrator.ResetSessionKey.patch(req)            | accountid=   |            |
| global.api.Administrator.Session.get(req)                      | sessionid=   |            |
| global.api.Administrator.Sessions.get(req)                     |              |            |
| global.api.Administrator.SessionsCount.get(req)                |              |            |
| global.api.Administrator.SetAccountAdministrator.patch(req)    | accountid=   |            |
| global.api.Administrator.SetAccountDeleted.patch(req)          | accountid=   |            |
| global.api.Administrator.SetOwnerAccount.patch(req)            | accountid=   |            |
| global.api.user.Account.get(req)                               | accountid=   |            |
| global.api.user.CreateAccount.post(req)                        |              |            |
| global.api.user.CreateProfile.post(req)                        | accountid=   |            |
| global.api.user.CreateResetCode.post(req)                      | accountid=   |            |
| global.api.user.CreateSession.post(req)                        | accountid=   |            |
| global.api.user.DeleteProfile.delete(req)                      | profileid=   |            |
| global.api.user.DeleteResetCode.delete(req)                    | codeid=      |            |
| global.api.user.Profile.get(req)                               | profileid=   |            |
| global.api.user.Profiles.get(req)                              | accountid=   |            |
| global.api.user.ProfilesCount.get(req)                         | accountid=   |            |
| global.api.user.ResetAccountDeleted.patch(req)                 | accountid=   |            |
| global.api.user.ResetAccountPassword.patch(req)                | accountid=   |            |
| global.api.user.ResetCode.get(req)                             | codeid=      |            |
| global.api.user.ResetCodes.get(req)                            | accountid=   |            |
| global.api.user.ResetCodesCount.get(req)                       | accountid=   |            |
| global.api.user.ResetSessionKey.patch(req)                     | sessionid=   |            |
| global.api.user.ResetSessionUnlocked.patch(req)                | sessionid=   |            |
| global.api.user.Session.get(req)                               | sessionid=   |            |
| global.api.user.Sessions.get(req)                              | accountid=   |            |
| global.api.user.SessionsCount.get(req)                         | accountid=   |            |
| global.api.user.SetAccountDeleted.patch(req)                   | accountid=   |            |
| global.api.user.SetAccountPassword.patch(req)                  | accountid=   |            |
| global.api.user.SetAccountProfile.patch(req)                   | accountid=   |            |
| global.api.user.SetAccountUsername.patch(req)                  | accountid=   |            |
| global.api.user.SetSessionEnded.patch(req)                     | sessionid=   |            |
| global.api.user.SetSessionUnlocked.patch(req)                  | sessionid=   |            |
| global.api.user.UpdateProfile.patch(req)                       | profileid=   |            |

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

Dashboard accounts optionally support anonymous registration and irreversibly encrypt signin username and passwords.  There are no third-party trackers, analytics or resources embedded in Dashboard pages.  

#### Development

Development takes place on [Github](https://github.com/userappstore).  Releases, documentation and issues are hosted on [Github](https://github.com/userappstore) and [NPM](https://www.npmjs.com/package/@userappstore/dashboard).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.