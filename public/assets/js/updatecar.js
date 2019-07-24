const refreshTimeoutms = 5000;

const carUpdater = new function() {
    this.carID = null;
    this.active = false;
    this.marker = null;
    this.init = (carObject) => {
        this.carID = carObject;
        this.run();
        if (typeof L != 'undefined') {
            this.marker = L.marker([0, 0]);
        }
    };
    this.run = () => {
        $.ajax({
            type: 'GET',
            url: window.location.protocol + '//' + window.location.host + '/console/getlocation?carID=' + this.carID,
            xhrFields: {
                withCredentials: true
            }
        }).done((data) => {
            // reset marker location
            if (data.status == 'OK') {
                let locations = data.locations;
                if (locations != null) {
                    // get last location
                    let latlon = { lat: locations[locations.length - 1].lat, lng: locations[locations.length - 1].lon };
                    this.marker.setLatLng(latlon);
                    if (!this.active) {
                        this.active = true;
                        this.marker.addTo(map);
                        map.flyTo(latlon, 14);
                    }
                }
            } else {
                console.log(data.status);
            }
        }).always(() => {
            setTimeout(this.run, refreshTimeoutms);
        });
    };
}