angular.module('starter.services', [])

        .factory('SalBr', function ($http) {
            // URL
            var baseURL = "http://www.salbr.mx/";
            //var baseURL = "http://localhost/salbr/";
            var apiURL = baseURL + 'api/';

            // SESSION
            var sessionActive = false;
            var user = {
            };

            var loadPreviousSession = function () {
                var salbr_token = window.localStorage.getItem('salbr_token');
                $http.post(apiURL + 'user/recoverSessionData',
                        {token: salbr_token})
                        .success(function (response) {
                            if (response.error) {
                                sessionActive = false;
                                user = {};
                            } else {
                                sessionActive = true;
                                user = response.user;
                            }
                        });
            };

            var FBLoginSuccess = function (response) {
                $http.post(baseURL + 'startFBSession', {
                    accessToken: response.authResponse.accessToken
                })
                        .success(statFBSession);
            };

            var FBLoginFail = function (response) {
                sessionActive = false;
            };

            function statFBSession(response) {
                if (response.error) {
                    return alert(response.message);
                }
                sessionActive = true;
                user = response.userData;
                window.localStorage.setItem('salbr_token', response.userData.token);
            }


            //SEARCH VARIABLES
            var searchParams = {
                search_params: '',
                id_category: null,
                id_child_category:null,
                id_state: 21,
                id_city: null,
                current_page: 1,
                total_pages: 0
            };
            var searchResults = [];
            function setSearchResults(results) {
                searchResults = results;
            }

            var categories = [];
            var states = [];
            var cities = [];
            var searchResults = {
                total_registries: 0,
                current_page: 1,
                data: []
            };
            myServiceId = {
                key1: [],
                key2: []
            }

            var previous_search = false;

            //MY ORDERS
            myOrders = {
                page: 1,
                data: [],
                total_pages: 0,
                total_lines:0
            };

            myIncomingOrders = {
                page: 1,
                data: [],
                total_pages: 0,
                total_lines:0
            };

            activeOrder = null;

            return {
                previous_search: function () {
                    return previous_search;
                },
                getBaseURL: function () {
                    return baseURL;
                },
                getAPIURL: function () {
                    return apiURL;
                },
                getSearch: function () {
                    return searchParams;
                },
                search: function (newSearchParams) {
                    previous_search = true;
                    searchParams = angular.merge(searchParams, newSearchParams);
                    searchParams.live = 1;
                    $http.post(apiURL + 'Publication/listPublications', searchParams).
                            success(function (response) {
                                searchResults = response;
                            }).
                            error(function (data) {
                                console.log(data);
                            });
                },
                recoverSession: function () {
                    return loadPreviousSession();
                },
                getUser: function () {
                    return user;
                },
                fetchCities: function () {
                    $http.get(baseURL + 'listCities/' + searchParams.id_state).
                            success(function (response) {
                                cities = response.data;
                                return cities;
                            });
                },
                getCities: function () {
                    return cities;
                },
                fetchCategories: function () {
                    $http.get(apiURL + 'Category/getCategoryTree').
                            success(function (response) {
                                categories = response;
                                return categories;
                            });
                },
                getCategories: function () {
                    return categories;
                },
                getSearchResults: function () {
                    return searchResults;
                },
                viewPublication: function (id_publication) {
                    for (var i = 0; i < searchResults.data.length; i++) {
                        if (parseInt(searchResults.data[i].id_publication) === parseInt(id_publication)) {
                            return searchResults.data[i];
                        }
                    }
                    return null;
                },
                sessionActive: function () {
                    return sessionActive;
                },
                FBLogin: function () {
                    facebookConnectPlugin.login(['email'], FBLoginSuccess, FBLoginFail);
                },
                logout: function () {
                    if (confirm('¿Confirma que desea cerrar su sesión?')) {
                        user = {};
                        sessionActive = false;
                    }
                },
                addOrder: function (order) {
                    $http.post(apiURL + 'order/addOrder/', order)
                            .success(function (response) {
                                return showOrderAlert(response);
                            });
                },
                getMyOrders: function () {
                    return myOrders;
                },
                fetchMyOrders: function (page) {
                    if (!page) {
                        page = 1;
                    } else if (page === 'next') {
                        page = myOrders.page++;
                        if (page > myOrders.total_pages) {
                            return false;
                        }
                    }

                    $http.get(apiURL + 'order/getMyOrders?page=' + page)
                            .success(function (response) {
                                myOrders.total_pages = response.total_pages;
                                myOrders.page = response.current_page;
                                myOrders.total_lines = response.total_lines;
                                if (page === 1) {
                                    myOrders.data = response.data;
                                } else {
                                    myOrders.data.concat(response.data);
                                }
                            });
                },
                getMyIncomingOrders: function () {
                    return myIncomingOrders;
                },
                fetchMyIncomingOrders: function (page) {
                    if (!page) {
                        page = 1;
                    } else if (page === 'next') {
                        page = myIncomingOrders.page++;
                        if (page > myIncomingOrders.total_pages) {
                            return false;
                        }
                    }

                    $http.get(apiURL + 'order/getMyIncomingOrders?page=' + page)
                            .success(function (response) {
                                myIncomingOrders.total_pages = response.total_pages;
                                myIncomingOrders.page = response.current_page;
                                myIncomingOrders.total_lines = response.total_lines;
                                if (page === 1) {
                                    myIncomingOrders.data = response.data;
                                } else {
                                    myIncomingOrders.data.concat(response.data);
                                }
                            });
                },
                getOrderStatus: function (status) {
                    switch (+status) {
                        case 0:
                            return 'Solicitada';
                        case 1:     
                            return 'Aceptada';
                        case 2:    
                            return 'En Proceso';
                        case 3: 
                            return 'Terminada';
                        case 4:                             
                            return 'Calificada';
                        case 5:
                            return 'Cancelada';
                    }
                },
                getOrderStatusClass: function (status) {
                    switch (parseInt(status,10)) {
                        case 0:
                            return 'ion-record positive';
                        case 1:
                            return 'ion-record energized';
                        case 2:
                            return 'ion-record balanced';
                        case 3:
                            return 'ion-checkmark-circled balanced';
                        case 4:
                            return 'ion-ios-star balanced';
                        case 5:
                            return 'ion-record assertive';
                    }
                },
                getMyServiceId: function () {
                        return myServiceId;
                },
                fetchServiceId: function () {
                    $http.get(apiURL + 'order/ServiceId')
                            .success(function (response) {
                                myServiceId.key1 = response.key1;
                                myServiceId.key2 = response.key2;
                                return false;
                            });
                },
                getMyGcm: function (sender) {
                        var push = PushNotification.init({ "android": {"senderID": sender}});
                        push.on('registration', function(data) {
                                console.log(data.registrationId);
                                document.getElementById("gcm_id").innerHTML = data.registrationId;
                                return gcm_id
                        });

                        push.on('notification', function(data) {
                                alert(data.title+" Message: " +data.message);
                        });

                        push.on('error', function(e) {
                                alert(e);
                        });
                }
            };
        });
