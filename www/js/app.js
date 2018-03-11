// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);

                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });
        })

        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

            $ionicConfigProvider.tabs.position('bottom');

            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js
            $stateProvider

                    // setup an abstract state for the tabs directive
                    .state('tab', {
                        url: '/tab',
                        abstract: true,
                        templateUrl: 'templates/tabs.html'
                    })

                    // Each tab has its own nav history stack:

                    .state('tab.start', {
                        url: '/start',
                        views: {
                            'tab-start': {
                                templateUrl: 'templates/tab-start.html',
                                controller: 'StartCtrl'
                            }
                        }
                    })

                    .state('tab.publication-detail', {
                        url: '/chats/:id_publication',
                        views: {
                            'tab-start': {
                                templateUrl: 'templates/publication-detail.html',
                                controller: 'PublicationDetailCtrl'
                            }
                        }
                    })

                    .state('tab.account', {
                        url: '/account',
                        views: {
                            'tab-account': {
                                templateUrl: 'templates/tab-account.html',
                                controller: 'AccountCtrl'
                            }
                        }
                    })

                    //MIS ÓRDENES
                    .state('tab.account-orders', {
                        url: '/account/mis_ordenes',
                        views: {
                            'tab-account': {
                                templateUrl: 'templates/account/orders.html',
                                controller: 'MyOrdersCtrl'
                            }
                        }
                    })

                    //DETALLE DE MI ÓRDEN
                    .state('tab.account-orders-detail', {
                        url: '/account/order/:id_order',
                        views: {
                            'tab-account': {
                                templateUrl: 'templates/account/order-detail.html',
                                controller: 'MyOrderDetailCtrl'
                            }
                        }
                    })

                    //ÓRDENES ENTRANTES
                    .state('tab.account-ordenes_entrantes', {
                        url: '/account/ordenes_entrantes',
                        views: {
                            'tab-account': {
                                templateUrl: 'templates/account/ordenes_entrantes.html',
                                controller: 'IncomingOrdersCtrl'
                            }
                        }
                    })

                    //DETALLES DE UNA ÓRDEN ENTRANTE
                    .state('tab.account-incoming_order', {
                        url: '/account/incoming_order/:id_order',
                        views: {
                            'tab-account': {
                                templateUrl: 'templates/account/incoming_order.html',
                                controller: 'IncomingOrderCtrl'
                            }
                        }
                    })

                    //MIS PUNTOS
                    .state('tab.account-puntos', {
                        url: '/account/puntos',
                        views: {
                            'tab-account': {
                                templateUrl: 'templates/account/puntos.html',
                                controller: 'MyPointsCtrl'
                            }
                        }
                    })

                    //MI CÓDIGO DE CLIENTE
                    .state('tab.account-mi_codigo', {
                        url: '/account/mi_codigo',
                        views: {
                            'tab-account': {
                                templateUrl: 'templates/account/mi_codigo.html',
                                controller: 'MyClientCodeCtrl'
                            }
                        }
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/tab/start');

        });
