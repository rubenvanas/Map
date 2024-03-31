const $locationContainer = $(".location-container");
const $imageHorizontalScroll = $(".image-horizontal-scroll");
const $location = $(".location");
const $locationImage = $(".location-image");
const $locationHour = $(".location-hour");

$locationContainer.removeClass("is--show");
$imageHorizontalScroll.removeClass("is--show");
$location.removeClass("is--show");
$locationImage.removeClass("is--show");
$locationHour.removeClass("is--show");

const markerElements = {};

function getCategoryClassName(category) {
  const categoryMap = {
    'nightlife': 'nightlife-marker',
    'food': 'food-marker',
    'fashion': 'fashion-marker',
    'activities': 'activities-marker',
    'coffee': 'coffee-marker',
    'drinks': 'drinks-marker',
    'culture': 'culture-marker'
  };
  return categoryMap[category] || '';
}

function getCategoryFromClass(className) {
  const classMap = {
    'nightlife-marker': 'nightlife',
    'food-marker': 'food',
    'fashion-marker': 'fashion',
    'activities-marker': 'activities',
    'coffee': 'coffee-marker',
    'drinks': 'drinks-marker',
    'culture': 'culture-marker'
  };
  return classMap[className] || '';
}

let isDragging = false;
let atTop = false;
let modalExpanded = false;
let startTouchY;
let initialTouchY;
let currentTouchY;
const dragMultiplier = 1.1;
let percentage = 0;
let currentPercentage = 0;
let dragTimeOut;

const draggableModal = document.getElementById('location-container');
const modalHeader = document.getElementById('popUpHeader');
const linkBlock = document.getElementsByClassName('linkblock w-inline-block');
const shrinkPopUp = document.getElementsByClassName('shrinkpopup');
const navigatorBlack = document.getElementById('navigatorBlack');
const navigator = document.getElementById('navigator');
const mapWrapper = document.getElementById('map');
const clickElement = document.getElementsByClassName('openoverlayclickelement');
const section6 = document.getElementById('section-6');

function closePopup() {
  $('.location-container.is--show').removeClass('is--show');
}

mapboxgl.accessToken = "pk.eyJ1IjoicnViZW52YW5hcyIsImEiOiJjbG1yZ254eTIwNzA0MmpxbWZxb2xrMnFnIn0.5vvnj09mA5wyPg95Yf-Xdw";

const getLocationData = () => {
  const locationElements = document.querySelectorAll('#location-data .location');
  return Array.from(locationElements).map(element => ({
    id: element.getAttribute('data-id'),
    lat: parseFloat(element.getAttribute('data-lat')) || 0,
    lng: parseFloat(element.getAttribute('data-lng')) || 0,
    cat: element.getAttribute('data-cat') || ''
  }));
};

const initializeMap = () => {
  const locations = getLocationData();

  if (locations.length === 0) {
    console.error('No locations found.');
    return;
  }

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rubenvanas/ck4jrik410wx21cmfitzm40ja',
    center: [4.906398, 52.375210],
    zoom: 11.60
  });

  const bounds = [
    [4.736329, 52.284719],
    [5.042724, 52.459298]
  ];

  map.setMaxBounds(bounds);

const geolocateUser = (map) => {
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      fitBoundsOptions: {
        linear: false
      },
      trackUserLocation: false
    });
    map.addControl(geolocate);
    map.on('load', function() {
      geolocate.trigger();
    });
    geolocate.on('geolocate', function(e) {
      map.flyTo({
        zoom: 15,
        center: [e.coords.longitude, e.coords.latitude]
      });
    });
  }
  

  locations.forEach(location => {
    const markerElement = document.createElement('div');
    markerElement.className = getCategoryClassName(location.cat);

    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'bottom',
    })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    markerElements[location.id] = markerElement;

    markerElement.addEventListener('click', () => {
      $(".location-container").addClass("is--show");
      $(".image-horizontal-scroll").addClass("is--show");
      $('.location-container').css('height', 'auto');

      event.stopPropagation();

      if ($(".location.is--show").length) {
        $(".location").removeClass("is--show");
      }

      if ($(".location-hour.is--show").length) {
        $(".location-hour").removeClass("is--show");
      }

      if ($(".location-image.is--show").length) {
        $(".location-image").removeClass("is--show");
      }

      $(".location[data-id='" + location.id + "']").addClass("is--show");
      $(".location-hour[data-id='" + location.id + "']").addClass("is--show");
      $(".location-image[locationImageID='" + location.id + "']").addClass("is--show");
      map.flyTo({ center: [location.lng, location.lat], zoom: 16 });
    });
  });

  $(document).on('click', '.filter-div', function (event) {
    const isSelected = $(this).hasClass('selected');
    $('.filter-div').removeClass('selected');

    if (isSelected) {
      locations.forEach(location => {
        const markerElement = markerElements[location.id];
        if (markerElement) {
          markerElement.style.display = 'block';
        }
      });
    } else {
      $(this).addClass('selected');
      const selectedCategory = $(this).attr('class').split(' ')[1];
      locations.forEach(location => {
        const markerElement = markerElements[location.id];
        if (markerElement) {
          const category = location.cat;
          markerElement.style.display = selectedCategory.includes(category) ? 'block' : 'none';
        }
      });
    }
  });

  $('.location .close-button').click(function (event) {
    event.stopPropagation();
    closePopup();
    console.log('close pop-up triggered by close-button');
  });

  map.on('click', function (event) {
    closePopup();
    console.log('close pop-up triggered by map');
  });
};

function updateStyles(percentage) {
  const originalMarginTop = 60;
  const originalRounding = 30;
  const originalPadding = 24;

  const newMarginTop = 0;
  const newRounding = 0;
  const newPadding = 80;

  const currentMarginTop = originalMarginTop + (newMarginTop - originalMarginTop) * percentage;
  const currentRounding = originalRounding + (newRounding - originalRounding) * percentage;
  const currentPadding = originalPadding + (newPadding - originalPadding) * percentage;

  document.documentElement.style.setProperty('--pop-up-margin-top', `${currentMarginTop}vh`);
  document.documentElement.style.setProperty('--pop-up-rounding', `${currentRounding}px`);
  document.documentElement.style.setProperty('--padding', `${currentPadding}px`);
}

function stylesDragUp() {
	console.log('stylesDragUp triggered');
  modalExpanded = true;
  atTop = true;
  
  	for (let i = 0; i < linkBlock.length; i++) {
    	linkBlock[i].style.display = 'none';
  	}
  	
    for (let i = 0; i < clickElement.length; i++) {
    	clickElement[i].style.display = 'none';
  	}
  	
    for (let i = 0; i < shrinkPopUp.length; i++) {
    	shrinkPopUp[i].style.display = 'block'; 
  	}
  
  dragTimeOut = setTimeout(() => {
  	navigatorBlack.style.opacity = '100%';
  	navigator.style.opacity = '0%';
  	mapWrapper.style.opacity = '0%';
    section6.style.height = '100%';
  }, 500);
  
}

function stylesDragDown() {
	clearTimeout(dragTimeOut);
  console.log('stylesDragDown triggered');
  
  modalExpanded = false;

   	for (let i = 0; i < linkBlock.length; i++) {
    	linkBlock[i].style.display = 'block';
  	}
  	
    for (let i = 0; i < clickElement.length; i++) {
    	clickElement[i].style.display = 'block';
  	}
  	
    for (let i = 0; i < shrinkPopUp.length; i++) {
    	shrinkPopUp[i].style.display = 'none'; 
  	}
  navigatorBlack.style.opacity = '0%';
  navigator.style.opacity = '100%';
  mapWrapper.style.opacity = '100%';
  section6.style.height = 'auto';
  
}

draggableModal.addEventListener('touchstart', (event) => {
  isDragging = true;
  startTouchY = initialTouchY = event.touches[0].clientY;
  currentTouchY = initialTouchY;
  
  // Get the computed value of --pop-up-margin-top
	const computedMarginTop = getComputedStyle(document.documentElement).getPropertyValue('--pop-up-margin-top');

	// Convert the computed value to a number (remove 'vh' and convert to a float)
	const marginTop = parseFloat(computedMarginTop);

	if (marginTop === 0) {
  	modalExpanded = true;
	} else {
  	modalExpanded = false;
    atTop = false;
  }
  
  console.log('marginTop: ', marginTop);
  console.log('modalExpanded:', modalExpanded);
  
  section6.addEventListener('scroll', () => {    
    if (section6.scrollTop === 0) {
    	atTop = true;
    } else {
      atTop = false;
    }
  })  
 console.log('atTop: ', atTop);

});

draggableModal.addEventListener('touchmove', (event) => {
  if (isDragging) {
    currentTouchY = event.touches[0].clientY;
    const deltaY = currentTouchY - startTouchY;

    const dynamicChange = deltaY;


    startTouchY = currentTouchY;

    const distanceCovered = initialTouchY - currentTouchY;
    const percentageChange = distanceCovered / window.innerHeight;

    percentage = currentPercentage + percentageChange;

    if (!modalExpanded && currentTouchY < initialTouchY) {
      console.log('modalExpand triggered in touchMove');
      updateStyles(percentage);
    } else if (atTop && currentTouchY > initialTouchY) {
    	console.log('modalShrink triggered in touchMove');
      updateStyles(percentage);
      stylesDragDown();
    }
  }
});

draggableModal.addEventListener('touchend', (event) => {
  isDragging = false;
  const endTouchY = event.changedTouches[0].clientY;

  if (!modalExpanded && currentTouchY < initialTouchY) {
    console.log('modalExpand triggered in touchEnd');
    percentage = 1;
    updateStyles(percentage);
    stylesDragUp();
  } else if (atTop && currentTouchY > initialTouchY) {
    console.log('modalShrink triggered in touchEnd');
    percentage = 0;
    updateStyles(percentage);
    stylesDragDown();
    atTop = false;
  } else if (!modalExpanded && currentTouchY > initialTouchY) {
    console.log('closePopup triggered in touchEnd');
    closePopup();
  } 

  currentPercentage = percentage;
});


initializeMap();