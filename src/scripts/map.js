var Map = function(container, config) {
	if (!document.getElementById(container)) throw new Error('Invalid container');

	this.markers = [];
	this._map = new google.maps.Map(document.getElementById(container), config);
	this._markerClusterer = new MarkerClusterer(this._map);

	this.updateClusters = function() {
		this._markerClusterer.clearMarkers();
		this._markerClusterer.addMarkers(this.markers.map(function(marker) {
			return marker._marker;
		}));
	};

	this.updateZoom = function() {
		if (this.markers.length == 0) {
			this._map.setCenter(config.center);
			this._map.setZoom(config.zoom);
		} else if (this.markers.length == 1) {
			this._map.setCenter(this.markers[0].position);
			this._map.setZoom(16);
		} else {
			var bounds = new google.maps.LatLngBounds();

			this.markers.forEach(function(marker) {
				bounds.extend(new google.maps.LatLng(marker.position.lat, marker.position.lng));
			});

			this._map.fitBounds(bounds);
		}
	};

	this.addMarker = function(marker) {
		if (!(marker instanceof Marker)) throw new Error('Invalid marker');

		var ctx = this;

		// Создаем маркер
		marker._marker = new google.maps.Marker({
			map: this._map,
			position: marker.position,
			title: marker.name,
			animation: google.maps.Animation.DROP
		});

		// Создаем информационное окно
		marker._infowindow = new google.maps.InfoWindow({
			content: marker.getPopover()
		});

		// Вешаем обработчик для открытия информационного окна
		google.maps.event.addListener(marker._marker, 'click', function() {
			// Закрываем все информационные окна
			ctx.markers.forEach(function(marker) {
				marker._infowindow.close(ctx._map, marker._marker);
			});

			// Открываем информационное окно
			marker._infowindow.open(ctx._map, marker._marker);
		});

		this.markers.push(marker);
//		this.updateClusters();
		this.updateZoom();
	};
};

var Marker = function(config) {
	if (!config.id) throw new Error('Invalid id');

	this.id = config.id;
	this.position = config.position;
	this.name = config.name;
	this.address = config.address;

	this.getPopover = function() {
		return '' +
			'<b><a href="/articles/' + this.id + '/">' + this.name + '</a></b><br><br>' +
			'<a href="/articles/' + this.id + '/"><img src="/articles/' + this.id + '/photos/cover.jpg" style="width: 200px; border-radius: 3px"></a><br><br>' +
			'<div style="width: 200px">Адрес: ' + this.address + '</div>';
	};
};