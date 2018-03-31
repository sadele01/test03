angular.module('starter.controllers', ['ionic'])

        .controller('mainController', function ($scope, SalBr) {
            SalBr.recoverSession();
        })

        .controller('StartCtrl', function ($scope, $http, SalBr) {
            SalBr.fetchCities();
            SalBr.fetchCategories();
            $scope.SalBr = SalBr;
            $scope.forms = {};

            $scope.search = SalBr.getSearch();

            $scope.childCategory = false;

            $scope.onChangeCategory = function () {
                var cats = SalBr.getCategories();
                $scope.id_child_category = null;
                for (var master in cats) {
                    for (var i in cats[master].children) {
                        category = cats[master].children[i];
                        if (category.id_category == $scope.search.id_category) {
                            if (!category.children) {
                                $scope.childCategory = false;
                            } else {
                                $scope.forms.search.$invalid = true;
                                $scope.childCategory = category;
                            }
                            return null;
                        }
                    }
                }
            };


            $scope.getStarClass = function (star, rating) {
                return parseInt(rating) >= star ? 'active' : 'inactive';
            };
        })

        .controller('ChatsCtrl', function ($scope, Chats) {
            // With the new view caching in Ionic, Controllers are only called
            // when they are recreated or on app start, instead of every page change.
            // To listen for when this page is active (for example, to refresh data),
            // listen for the $ionicView.enter event:
            //
            //$scope.$on('$ionicView.enter', function(e) {
            //});

            $scope.chats = Chats.all();
        })


        .controller('PublicationDetailCtrl', function ($scope, $location, $stateParams, SalBr, $ionicModal, $ionicPopup, $http) {
            $scope.SalBr = SalBr;
            $scope.publication = SalBr.viewPublication($stateParams.id_publication);
            if (null === $scope.publication) {
                console.log($location.path('/'));
            }

            $scope.images = $scope.publication.images === "" ? [] : $scope.publication.images.split(',');

            $scope.getStarClass = function (star, rating) {
                return parseInt(rating) >= star ? 'active' : 'inactive';
            };

            $ionicModal.fromTemplateUrl('templates/modals/new-order.html', {
                scope: $scope,
                focusFirstInput: true
            }).then(function (modal) {
                $scope.modal = modal;
            });

            $scope.openModal = function () {
                $scope.modal.show();
            };

            $scope.closeModal = function () {
                $scope.modal.hide();
            };

            /// NEW ORDER
            $scope.new_order = {
                text: '',
                latitude: 0,
                longitude: 0,
                id_publication: $scope.publication.id_publication,
                id_category: $scope.publication.id_category,
                skipEncoding: 1
            };

            $scope.sendNewOrder = function () {
                $http.post(SalBr.getAPIURL() + 'order/addOrder/', $scope.new_order)
                        .success(function (response) {
                            var alertTemplate = '';
                            var alertTitle = "";
                            if (response.error) {
                                alertTitle = "Error";
                                alertTemplate = '<p class="text-center">' + response.message + "</p>";
                            } else {
                                alertTitle = "Órden enviada";
                                alertTemplate = '<p class="text-center">La órden que ha solicitado ha sido enviada a:<br><strong>' + $scope.publication.title + "</strong></p>";
                            }
                            $ionicPopup.alert({
                                'title': alertTitle,
                                'template': alertTemplate,
                                'okType': 'button-dark'
                            });
                        });

                $scope.modal.hide();
                //$scope.new_order.text = '';
            };
        })

        .controller('AccountCtrl', function ($scope, SalBr) {
            $scope.SalBr = SalBr;
        })

        .controller('MyOrdersCtrl', function ($scope, SalBr) {
            SalBr.fetchMyOrders();
            $scope.SalBr = SalBr;
        })

        .controller('MyOrderDetailCtrl', function ($scope, SalBr, $stateParams, $http, $ionicPopup) {
            $scope.SalBr = SalBr;
            $scope.order = null;

            $http.get(SalBr.getAPIURL() + 'order/getOrderDetails?id_order=' + $stateParams.id_order)
                    .success(function (response) {
                        $scope.order = response;
                    });

            $scope.offerAccepted = false;

            $scope.answerPublicationOffer = function (offerResponse) {
                $scope.offerAccepted = offerResponse;
                var accepted = offerResponse ? 'ACEPTAR' : 'CANCELAR';
                $ionicPopup.confirm({
                    title: 'Confirmar respuesta',
                    template: '¿Confirma que desea <strong>' + accepted + '</strong> la oferta?',
                    cancelText: 'NO',
                    okText: 'SI',
                    okType: 'button-dark'
                }).then(sendAnswerPublicationOffer);
            };

            sendAnswerPublicationOffer = function (confirmation) {
                if (confirmation) {
                    $http.post(SalBr.getAPIURL() + 'order/answerPublicationOffer', {
                        id_order: $stateParams.id_order,
                        response: $scope.offerAccepted
                    }).then(manageResponse);
                }
            };

            manageResponse = function (response) {
                var title = 'ERROR';
                var message = response.data.message;
                if (!response.data.error) {
                    title = 'Respuesta enviada';
                    $scope.order.data.answered_by_client = 1;
                    $scope.order.data.client_response = 1;
                }

                $ionicPopup.alert({
                    title: title,
                    okType: 'dark',
                    template: response.data.message
                });
            };

            $scope.finishOrder = function () {
                $ionicPopup.confirm({
                    title: 'Confirmar terminación',
                    template: '¿Confirma que éste servicio ha sido terminado?',
                    cancelText: 'NO',
                    okText: 'SI',
                    okType: 'button-dark'
                }).then(sendFinishOrder);
            };

            sendFinishOrder = function () {
                $http.post(SalBr.getAPIURL() + 'order/finishOrder', {
                    id_order: $stateParams.id_order
                }).then(function (response) {
                    if (!response.data.error) {
                        $scope.order.data.status = 3;
                    }
                });
            };

            $scope.ranking = {
                setValue: function (n) {
                    $scope.rank.qualification = n;
                },
                isActive: function (n) {
                    return (n <= $scope.rank.qualification) ? 'active' : '';
                }
            };

            $scope.rank = {
                qualification: 0,
                comment: '',
                id_order: $stateParams.id_order
            };

            $scope.sendQualification = function () {
                //validating qualification
                if ($scope.rank.qualification === 0) {
                    $ionicPopup.alert({
                        title: 'ERROR',
                        okType: 'dark',
                        template: 'Por favor seleccione un valor para su calificación'
                    });
                } else {
                    qualifyPublication();
                }
            };

            qualifyPublication = function () {
                $http.post(SalBr.getAPIURL() + 'order/qualifyPublication/', $scope.rank)
                        .then(function (response) {
                            var title = 'ERROR';
                            if (!response.data.error) {
                                title = 'Calificación enviada';
                                response.data.message = "Gracias por calificar!";
                                $scope.order.data.id_publication_qualification = response.data.inserted_id;
                            }
                            $ionicPopup.alert({
                                title: title,
                                okType: 'dark',
                                template: response.data.message
                            });
                        });
            };
        })

        .controller('IncomingOrdersCtrl', function ($scope, SalBr, $http) {
            SalBr.fetchMyIncomingOrders();
            $scope.SalBr = SalBr;
        })

        .controller('IncomingOrderCtrl', function ($scope, SalBr, $http, $stateParams, $ionicPopup) {
            $scope.SalBr = SalBr;
            $scope.order = null;
            $scope.onlyNumbers = /^\d{0,9}(\.\d{1,9})?$/;

            $scope.answer = {
                id_order: $stateParams.id_order,
                response: 0,
                text: '',
                cost: 0
            };

            $http.get(SalBr.getAPIURL() + 'order/getIncomingOrderDetails?id_order=' + $stateParams.id_order)
                    .success(function (response) {
                        $scope.order = response;
                    });

            $scope.answerOrder = function () {
                var accepted = $scope.answer.response ? 'ACEPTAR' : 'RECHAZAR';
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Confirmar respuesta',
                    template: '¿Confirma que desea <strong>' + accepted + '</strong> ésta órden?',
                    cancelText: 'NO',
                    okText: 'SI',
                    okType: 'button-dark'
                }).then(sendAnswer);
            };

            sendAnswer = function (confirmation) {
                if (confirmation) {
                    $http.post(SalBr.getAPIURL() + 'order/answerOrder', $scope.answer).then(manageResponse);
                }
            };

            manageResponse = function (response) {
                var title = 'ERROR';
                var message = response.data.message;
                if (!response.data.error) {
                    title = 'Respuesta enviada';
                    $scope.order.data.answered = 1;
                    $scope.order.data.publication_response = 1;
                    $scope.order.data.publication_response_text = $scope.answer.text;
                    $scope.order.data.cost = $scope.answer.cost;
                }

                $ionicPopup.alert({
                    title: title,
                    okType: 'dark',
                    template: response.data.message
                });
            };

            $scope.getAnswerStatus = function () {
                if ($scope.order.data.answered_by_client == 1) {
                    return 'Respondido por el cliente';
                } else {
                    return 'Esperando respuesta del cliente';
                }
            };

            $scope.startService = function () {
                $http.post(SalBr.getAPIURL() + 'order/startService', {
                    id_order: $stateParams.id_order
                }).then(function (response) {
                    var title = 'SalBr';
                    if (!response.data.error) {
                        $scope.order.data.status = 2;
                    }

                    $ionicPopup.alert({
                        title: title,
                        okType: 'dark',
                        template: response.data.message
                    });
                });
            };


            $scope.ranking = {
                setValue: function (n) {
                    $scope.rank.qualification = n;
                },
                isActive: function (n) {
                    return (n <= $scope.rank.qualification) ? 'active' : '';
                }
            };

            $scope.rank = {
                qualification: 0,
                comment: '',
                id_order: $stateParams.id_order
            };

            $scope.sendQualification = function () {
                //validating qualification
                if ($scope.rank.qualification === 0) {
                    $ionicPopup.alert({
                        title: 'ERROR',
                        okType: 'dark',
                        template: 'Por favor seleccione un valor para su calificación'
                    });
                } else {
                    qualifyClient();
                }
            };

            qualifyClient = function () {
                $http.post(SalBr.getAPIURL() + 'order/qualifyClient/', $scope.rank)
                        .then(function (response) {
                            var title = 'ERROR';
                            if (!response.data.error) {
                                title = 'Calificación enviada';
                                response.data.message = "Gracias por calificar!";
                                $scope.order.data.id_user_qualification = response.data.inserted_id;
                            }
                            $ionicPopup.alert({
                                title: title,
                                okType: 'dark',
                                template: response.data.message
                            });
                        });
            };

        })

        .controller('MyPointsCtrl', function ($scope, SalBr, $http) {
                myServiceId = {
                        page: 1,
                        data: [],
                        total_pages: 0,
                        total_lines:0
                };
                
                mygcm = {
                         user_key: null
                };

                SalBr.fetchMyServiceId();
                $scope.SalBr = SalBr;
 
            console.log('my points');
        })

        .controller('MyClientCodeCtrl', function ($scope, SalBr, $http) {
            $scope.SalBr = SalBr;
        })
        ;
