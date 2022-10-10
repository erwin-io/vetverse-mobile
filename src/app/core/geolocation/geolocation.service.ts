import { Injectable } from '@angular/core';
// import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  async printCurrentPosition(){
    // const coordinates = await Geolocation.getCurrentPosition();
    // console.log('Current position:', coordinates);
  }
}
