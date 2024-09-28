import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

if (environment.production) {
  enableProdMode();
}

const firebaseConfig = {
  apiKey: 'AIzaSyC0BsCRH_rYfEDUo_Tl9y10LI5sHstgXjU',
  authDomain: 'pruebaapp-c4d44.firebaseapp.com',
  projectId: 'pruebaapp-c4d44',
  storageBucket: 'pruebaapp-c4d44.appspot.com',
  messagingSenderId: '441368942075',
  appId: '1:441368942075:web:bc051e980417f6f26ee75e',
};

const fireSanti = {
  projectId: 'apps-pps-81fc4',
  appId: '1:489192954714:web:59d62ba684f68dfc79f163',
  storageBucket: 'apps-pps-81fc4.appspot.com',
  apiKey: 'AIzaSyBzmcqe7augEBw_saxrPQMrvSBXQzAxt14',
  authDomain: 'apps-pps-81fc4.firebaseapp.com',
  messagingSenderId: '489192954714',
};


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(fireSanti)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
  ],
});
