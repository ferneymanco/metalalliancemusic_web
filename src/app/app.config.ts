import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore'

import { routes } from './app.routes';

// Import the functions you need from the SDKs you need
import { initializeApp as firebaseInitializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRaQE4eKJn-urFM01rssyNKzAedo-fW5Q",
  authDomain: "metalalliancemusic.firebaseapp.com",
  projectId: "metalalliancemusic",
  storageBucket: "metalalliancemusic.firebasestorage.app",
  messagingSenderId: "448270506097",
  appId: "1:448270506097:web:e4ee4cb3c17110184ea3d0"
};

// Initialize Firebase
firebaseInitializeApp(firebaseConfig);

import { provideClientHydration } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() => firebaseInitializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()), provideAnimationsAsync(),
  ]
};
