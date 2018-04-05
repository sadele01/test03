function onDeviceReady() {
    //document.addEventListener("backbutton", onBackButton, false);
   fetchMyServiceId();

}

var IAMapp = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', onDeviceReady, false);
    }
};

function onBackButton(e) {
    e.preventDefault();
    if ($('imgModal').getStyle('display') === 'block') {
        $('imgModal').removeClass('in').setStyle('display', 'none');
    }
}
