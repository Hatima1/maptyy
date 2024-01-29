'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

///////////////
class workout {
  constructor(coords, distance, duration) {
    (this.coords = coords),
      (this.distance = distance),
      (this.duration = duration);
  }
  _duration() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.clcpace();
    this._duration();
  }
  clcpace() {
    this.pace = this.duration / this.distance;
  }
}
class Cycling extends workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.clcsped();
    this._duration();
  }
  clcsped() {
    this.speed = this.distance / (this.duration / 60);
  }
}

/////////////////////////app

class app {
  #map;
  #mapE; //mapevent when click
  #workouts = [];
  #mapZoom = 14;
  constructor() {
    this._getposition();
    ////det data
    this._localestorgget();
    this._showform();
    form.addEventListener('submit', this._newworkout.bind(this));
    inputType.addEventListener('change', this._toogle.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getposition() {
    navigator.geolocation.getCurrentPosition(
      this._lodmap.bind(this),
      function () {
        alert('lol man');
      }
    );
  }

  _lodmap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(position, latitude, longitude);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showform.bind(this));
    this.#workouts.forEach(a => this._rendermark(a));
  }

  _showform(pose) {
    this.#mapE = pose;

    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _toogle() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newworkout(e) {
    e.preventDefault();
    const valid = (...input) => input.every(a => Number.isFinite(a));
    const positive = (...input) => input.every(a => a > 0);

    const { lat, lng } = this.#mapE.latlng;
    let workout;
    let type = inputType.value;

    let coords = [lat, lng];
    let Distance = +inputDistance.value;
    let duration = +inputDuration.value;

    if (type === 'running') {
      console.log('lol');
      let cadence = +inputCadence.value;
      if (
        !valid(Distance, duration, cadence) ||
        !positive(Distance, duration, cadence)
      )
        return alert('not a number :(');

      workout = new Running(coords, Distance, duration, cadence);
      this.#workouts.push(workout);
      console.log(workout);
    }
    if (type === 'cycling') {
      console.log('lol');
      let elevation = +inputElevation.value;
      if (
        !valid(Distance, duration, elevation) ||
        !positive(Distance, duration, elevation)
      )
        return alert('not a number :(');

      workout = new Cycling(coords, Distance, duration, elevation);
      this.#workouts.push(workout);
      console.log(workout);
    }

    this._rendermark(workout);

    this._renderworkout(workout);

    this._hideForm();

    this._localestorg();
  }
  _rendermark(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          maxHeight: 200,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.description}`)
      .openPopup();
  }
  _renderworkout(workout) {
    let html = `
  
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
       
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
      
      </div>
      
    
        
        
        `;
    if (workout.type === 'running') {
      html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${Math.ceil(workout.pace)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon"> 🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `;
    }
    if (workout.type === 'cycling') {
      html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    if (!this.#map) return;

    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _localestorg() {
    localStorage.setItem('workout', JSON.stringify(this.#workouts));
  }
  _localestorgget() {
    const data = JSON.parse(localStorage.getItem('workout'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(a => this._renderworkout(a));
  }
  reset() {
    localStorage.removeItem('workout');
    location.reload();
  }
}

const mapapp = new app();
