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
