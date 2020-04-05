/* eslint-env mocha */
const assert = require('assert')
const mergePackageJSON = require('./merge-package-json.js')

describe('internal-api/merge-package-json', () => {
  describe('MergePackageJSON#loadRootJSON', () => {
    describe('Merged menu order', () => {
      it('should put application menus first', async () => {
        const applicationJSON = {
          dashboard: {
            menus: {
              administrator: [{
                href: 'application#administrator#1',
                text: 'application administrator 1'
              }],
              account: [{
                href: 'application#account#1',
                text: 'application account 1'
              }]
            }
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            menus: {
              administrator: [{
                href: 'dashboard#administrator#2',
                text: 'dashboard administrator 2'
              }, {
                href: 'dashboard#administrator#2',
                text: 'dashboard administrator 2'
              }],
              account: [{
                href: 'dashboard#account#3',
                text: 'dashboard account 3'
              }]
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        const administratorMenu = mergedJSON.dashboard.menus.administrator
        assert.strictEqual(administratorMenu.length, 3)
        assert.strictEqual(administratorMenu[0].text, applicationJSON.dashboard.menus.administrator[0].text)
        const accountMenu = mergedJSON.dashboard.menus.account
        assert.strictEqual(accountMenu.length, 2)
        assert.strictEqual(accountMenu[0].text, applicationJSON.dashboard.menus.account[0].text)
      })

      it('should put dashboard menus last', async () => {
        const applicationJSON = {
          dashboard: {
            menus: {
              administrator: [{
                href: 'application#administrator#1',
                text: 'application administrator 1'
              }],
              account: [{
                href: 'application#account#1',
                text: 'application account 1'
              }]
            }
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            menus: {
              administrator: [{
                href: 'dashboard#administrator#2',
                text: 'dashboard administrator 2'
              }, {
                href: 'dashboard#administrator#3',
                text: 'dashboard administrator 3'
              }],
              account: [{
                href: 'dashboard#account#2',
                text: 'dashboard account 2'
              }]
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        const administratorMenu = mergedJSON.dashboard.menus.administrator
        assert.strictEqual(administratorMenu.length, 3)
        assert.strictEqual(administratorMenu[1].text, dashboardJSON.dashboard.menus.administrator[0].text)
        assert.strictEqual(administratorMenu[2].text, dashboardJSON.dashboard.menus.administrator[1].text)
        const accountMenu = mergedJSON.dashboard.menus.account
        assert.strictEqual(accountMenu.length, 2)
        assert.strictEqual(accountMenu[1].text, dashboardJSON.dashboard.menus.account[0].text)
      })

      it('should put module menus between between application and dashboard', async () => {
        const applicationJSON = {
          dashboard: {
            menus: {
              administrator: [{
                href: 'application#administrator#1',
                text: 'application administrator 1'
              }],
              account: [{
                href: 'application#account#1',
                text: 'application account 1'
              }]
            },
            modules: ['testModule']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              menus: {
                administrator: [{
                  href: 'module#administrator#2',
                  text: 'module administrator 2'
                }],
                account: [{
                  href: 'module#account#2',
                  text: 'module account 2'
                }, {
                  href: 'module#account#3',
                  text: 'module account 3'
                }]
              }
            }
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            menus: {
              administrator: [{
                href: 'dashboard#administrator#3',
                text: 'dashboard administrator 3'
              }, {
                href: 'dashboard#administrator#4',
                text: 'dashboard administrator 4'
              }],
              account: [{
                href: 'dashboard#account#4',
                text: 'dashboard account 4'
              }]
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        const administratorMenu = mergedJSON.dashboard.menus.administrator
        assert.strictEqual(administratorMenu.length, 4)
        assert.strictEqual(administratorMenu[1].text, global.testModuleJSON.testModule.dashboard.menus.administrator[0].text)
        const accountMenu = mergedJSON.dashboard.menus.account
        assert.strictEqual(accountMenu.length, 4)
        assert.strictEqual(accountMenu[1].text, global.testModuleJSON.testModule.dashboard.menus.account[0].text)
        assert.strictEqual(accountMenu[2].text, global.testModuleJSON.testModule.dashboard.menus.account[1].text)
      })

      it('should include nested modules', async () => {
        const applicationJSON = {
          dashboard: {
            menus: {
              administrator: [{
                href: 'application#administrator#1',
                text: 'application administrator 1'
              }],
              account: [{
                href: 'application#account#1',
                text: 'application account 1'
              }]
            },
            modules: ['testModule']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              menus: {
                administrator: [{
                  href: 'module#administrator#2',
                  text: 'module administrator 2'
                }],
                account: [{
                  href: 'module#account#2',
                  text: 'module account 2'
                }, {
                  href: 'module#account#3',
                  text: 'module account 3'
                }]
              },
              modules: ['testModule2']
            }
          },
          testModule2: {
            dashboard: {
              menus: {
                administrator: [{
                  href: 'module#administrator#3',
                  text: 'module administrator 3'
                }, {
                  href: 'module#administrator#4',
                  text: 'module administrator 4'
                }],
                account: [{
                  href: 'module#account#4',
                  text: 'module account 4'
                }, {
                  href: 'module#account#5',
                  text: 'module account 5'
                }]
              }
            }
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            menus: {
              administrator: [{
                href: 'dashboard#administrator#5',
                text: 'dashboard administrator 5'
              }, {
                href: 'dashboard#administrator#6',
                text: 'dashboard administrator 6'
              }],
              account: [{
                href: 'dashboard#account#6',
                text: 'dashboard account 6'
              }]
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        const administratorMenu = mergedJSON.dashboard.menus.administrator
        assert.strictEqual(administratorMenu.length, 6)
        assert.strictEqual(administratorMenu[1].text, global.testModuleJSON.testModule.dashboard.menus.administrator[0].text)
        assert.strictEqual(administratorMenu[2].text, global.testModuleJSON.testModule2.dashboard.menus.administrator[0].text)
        assert.strictEqual(administratorMenu[3].text, global.testModuleJSON.testModule2.dashboard.menus.administrator[1].text)
        const accountMenu = mergedJSON.dashboard.menus.account
        assert.strictEqual(accountMenu.length, 6)
        assert.strictEqual(accountMenu[1].text, global.testModuleJSON.testModule.dashboard.menus.account[0].text)
        assert.strictEqual(accountMenu[2].text, global.testModuleJSON.testModule.dashboard.menus.account[1].text)
        assert.strictEqual(accountMenu[3].text, global.testModuleJSON.testModule2.dashboard.menus.account[0].text)
        assert.strictEqual(accountMenu[4].text, global.testModuleJSON.testModule2.dashboard.menus.account[1].text)
      })
    })

    describe('Merged content handler order', () => {
      it('should put application content handler last', async () => {
        const applicationJSON = {
          dashboard: {
            content: ['content-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            content: ['content-1', 'content-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.content[mergedJSON.dashboard.content.length - 1], applicationJSON.dashboard.content[0])
      })

      it('should put dashboard content handlers first', async () => {
        const applicationJSON = {
          dashboard: {
            content: ['content-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            content: ['content-1', 'content-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.content.length, 3)
        assert.strictEqual(mergedJSON.dashboard.content[0], dashboardJSON.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[1], dashboardJSON.dashboard.content[1])
      })

      it('should put module content handlers between dashboard and application', async () => {
        const applicationJSON = {
          dashboard: {
            content: ['content-5'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            content: ['content-1', 'content-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              content: ['content-3', 'content-4']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.content.length, 5)
        assert.strictEqual(mergedJSON.dashboard.content[0], dashboardJSON.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[1], dashboardJSON.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[2], global.testModuleJSON.testModule.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[3], global.testModuleJSON.testModule.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[4], applicationJSON.dashboard.content[0])
      })

      it('should include nested modules', async () => {
        const applicationJSON = {
          dashboard: {
            content: ['content-7'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            content: ['content-1', 'content-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              content: ['content-3', 'content-4'],
              modules: ['testModule2']
            }
          },
          testModule2: {
            dashboard: {
              content: ['content-5', 'content-6']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.content.length, 7)
        assert.strictEqual(mergedJSON.dashboard.content[0], dashboardJSON.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[1], dashboardJSON.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[2], global.testModuleJSON.testModule.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[3], global.testModuleJSON.testModule.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[4], global.testModuleJSON.testModule2.dashboard.content[0])
        assert.strictEqual(mergedJSON.dashboard.content[5], global.testModuleJSON.testModule2.dashboard.content[1])
        assert.strictEqual(mergedJSON.dashboard.content[6], applicationJSON.dashboard.content[0])
      })
    })

    describe('Merged proxy handler order', () => {
      it('should put application proxy handlers last', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy[mergedJSON.dashboard.proxy.length - 1], applicationJSON.dashboard.proxy[0])
      })

      it('should put dashboard proxy handlers first', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['content-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 3)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
      })

      it('should put module proxy handlers between dashboard and application', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-5'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              proxy: ['proxy-3', 'proxy-4']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 5)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[2], global.testModuleJSON.testModule.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[3], global.testModuleJSON.testModule.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[4], applicationJSON.dashboard.proxy[0])
      })

      it('should include nested modules', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-7'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              proxy: ['proxy-3', 'proxy-4'],
              modules: ['testModule2']
            }
          },
          testModule2: {
            dashboard: {
              proxy: ['proxy-5', 'proxy-6']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 7)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[2], global.testModuleJSON.testModule.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[3], global.testModuleJSON.testModule.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[4], global.testModuleJSON.testModule2.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[5], global.testModuleJSON.testModule2.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[6], applicationJSON.dashboard.proxy[0])
      })
    })


    describe('Merged proxy handler order', () => {
      it('should put application proxy handlers last', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy[mergedJSON.dashboard.proxy.length - 1], applicationJSON.dashboard.proxy[0])
      })

      it('should put dashboard proxy handlers first', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['content-3']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 3)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
      })

      it('should put module proxy handlers between dashboard and application', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-5'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              proxy: ['proxy-3', 'proxy-4']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 5)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[2], global.testModuleJSON.testModule.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[3], global.testModuleJSON.testModule.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[4], applicationJSON.dashboard.proxy[0])
      })

      it('should include nested modules', async () => {
        const applicationJSON = {
          dashboard: {
            proxy: ['proxy-7'],
            modules: ['testModule']
          }
        }
        const dashboardJSON = {
          version: 'test',
          name: '@userdashboard/dashboard',
          dashboard: {
            proxy: ['proxy-1', 'proxy-2']
          }
        }
        global.testModuleJSON = {
          testModule: {
            dashboard: {
              proxy: ['proxy-3', 'proxy-4'],
              modules: ['testModule2']
            }
          },
          testModule2: {
            dashboard: {
              proxy: ['proxy-5', 'proxy-6']
            }
          }
        }
        const mergedJSON = mergePackageJSON(applicationJSON, dashboardJSON)
        assert.strictEqual(mergedJSON.dashboard.proxy.length, 7)
        assert.strictEqual(mergedJSON.dashboard.proxy[0], dashboardJSON.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[1], dashboardJSON.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[2], global.testModuleJSON.testModule.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[3], global.testModuleJSON.testModule.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[4], global.testModuleJSON.testModule2.dashboard.proxy[0])
        assert.strictEqual(mergedJSON.dashboard.proxy[5], global.testModuleJSON.testModule2.dashboard.proxy[1])
        assert.strictEqual(mergedJSON.dashboard.proxy[6], applicationJSON.dashboard.proxy[0])
      })
    })
  })
})
