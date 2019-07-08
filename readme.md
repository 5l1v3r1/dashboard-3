# Dashboard

Dashboard is a NodeJS project that provides a reusable account management system for web applications. 

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.

Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

Application servers written for Dashboard can be published on websites running [app store software](https://github.com/userdashboard/app-store-dashboard-server) like [UserAppStore](https://userappstore.com).

- [Introduction](https://github.com/userdashboard/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userdashboard/dashboard/wiki/Configuring-Dashboard)
- [Dashboard code structure](https://github.com/userdashboard/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userdashboard/dashboard/wiki/Server-Request-Lifecycle)

### Case studies 
`Hastebin` is an open source pastebin web application.  It started as a service for anonymous guests only, and was transformed with Dashboard and modules into a web application for registered users with support for organizations and paid subscriptions.

- [Hastebin: free web application]()
- [Hastebin: subscription web application]()

 `Hastebin` is an anonymous pastebin web application for sharing code and text.  Read how it was tra


### Demonstrations

- [Dashboard](https://dashboard-demo-2344.herokuapp.com)
- [Dashboard + Organizations module](https://organizations-demo-7933.herokuapp.com)
- [Dashboard + Stripe Subscriptions module](https://stripe-subscriptions-5701.herokuapp.com)
- [Dashboard + Stripe Connect module](https://stripe-connect-8509.herokuapp.com)

## Dashboard storage

You can use Dashboard with your local file system or other storage backends with various pros and cons.  The storage may encrypts data with AES-256 encryption by specifying a 32-character encryption secret:

    ENCRYPTION_KEY="abcdefghijklmnopqrstuvwxyz123456"

| Name | Description | Package   | Repository |
|------|-------------|-----------|------------|
| Redis | Very fast but expensive to scale | @userdashboard/storage-redis | [github](https://github.com/userdashboard/storage-edis) |
| Amazon S3 | Slow but cheap to scale | @userdashboard/storage-s3 | [github](https://github.com/userdashboard/storage-s3) |
| PostgreSQL | Fast but not cheap to scale | @userdashboard/storage-postgreqsl | [github](https://github.com/userdashboard/storage-postgresql) |

You can code your own alternatives for other databases by mimicking the Storage API's basic operations to read, write and list data.

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
    $ npm install @userdashboard/dashboard --only=production
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
| /api/user/session                                 | GET    | sessionid=   |            |
| /api/user/sessions                                | GET    | accountid=   |            |
| /api/user/sessions-count                          | GET    | accountid=   |            |
| /api/user/set-account-deleted                     | PATCH  | accountid=   |            |
| /api/user/set-account-password                    | PATCH  | accountid=   |            |
| /api/user/set-account-profile                     | PATCH  | accountid=   |            |
| /api/user/set-account-username                    | PATCH  | accountid=   |            |
| /api/user/set-session-ended                       | PATCH  | sessionid=   |            |
| /api/user/update-profile                          | PATCH  | profileid=   |            |

## Access user information from the dashboard server

| Method                                             | Querystring  | POST data  |
|----------------------------------------------------|--------------|------------|
| global.api.administrator.Account.get(req)                      | accountid=   |            |
| global.api.administrator.AccountProfiles.get(req)              | accountid=   |            |
| global.api.administrator.AccountProfilesCount.get(req)         | accountid=   |            |
| global.api.administrator.AccountResetCodes.get(req)            | accountid=   |            |
| global.api.administrator.AccountResetCodesCount.get(req)       | accountid=   |            |
| global.api.administrator.AccountSessions.get(req)              | accountid=   |            |
| global.api.administrator.AccountSessionsCount.get(req)         | accountid=   |            |
| global.api.administrator.Accounts.get(req)                     |              |            |
| global.api.administrator.AccountsCount.get(req)                |              |            |
| global.api.administrator.AdministratorAccounts.get(req)        |              |            |
| global.api.administrator.AdministratorAccountsCount.get(req)   |              |            |
| global.api.administrator.CreateResetCode.post(req)             | accountid=   |            |
| global.api.administrator.DeleteAccount.delete(req)             | accountid=   |            |
| global.api.administrator.DeletedAccounts.get(req)              |              |            |
| global.api.administrator.DeletedAccountsCount.get(req)         |              |            |
| global.api.administrator.Profile.get(req)                      | profileid=   |            |
| global.api.administrator.Profiles.get(req)                     |              |            |
| global.api.administrator.ProfilesCount.get(req)                |              |            |
| global.api.administrator.ResetAccountAdministrator.patch(req)  | accountid=   |            |
| global.api.administrator.ResetCode.get(req)                    | codeid=      |            |
| global.api.administrator.ResetCodes.get(req)                   |              |            |
| global.api.administrator.ResetCodesCount.get(req)              |              |            |
| global.api.administrator.ResetSessionKey.patch(req)            | accountid=   |            |
| global.api.administrator.Session.get(req)                      | sessionid=   |            |
| global.api.administrator.Sessions.get(req)                     |              |            |
| global.api.administrator.SessionsCount.get(req)                |              |            |
| global.api.administrator.SetAccountAdministrator.patch(req)    | accountid=   |            |
| global.api.administrator.SetAccountDeleted.patch(req)          | accountid=   |            |
| global.api.administrator.SetOwnerAccount.patch(req)            | accountid=   |            |
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
| global.api.user.Session.get(req)                               | sessionid=   |            |
| global.api.user.Sessions.get(req)                              | accountid=   |            |
| global.api.user.SessionsCount.get(req)                         | accountid=   |            |
| global.api.user.SetAccountDeleted.patch(req)                   | accountid=   |            |
| global.api.user.SetAccountPassword.patch(req)                  | accountid=   |            |
| global.api.user.SetAccountProfile.patch(req)                   | accountid=   |            |
| global.api.user.SetAccountUsername.patch(req)                  | accountid=   |            |
| global.api.user.SetSessionEnded.patch(req)                     | sessionid=   |            |
| global.api.user.UpdateProfile.patch(req)                       | profileid=   |            |

## Privacy

Dashboard accounts optionally support anonymous registration and irreversibly encrypt signin username and passwords.  There are no third-party trackers, analytics or resources embedded in Dashboard pages.  

#### Development

Development takes place on [Github](https://github.com/userdashboard/dashboard) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/dashboard).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.