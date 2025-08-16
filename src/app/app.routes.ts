import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EfemeridesComponent } from './efemerides/efemerides.component';
import { ArtistsMapComponent } from './artists-map/artists-map.component';

export const routes: Routes = [
    {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'efemerides',
    component: EfemeridesComponent,
  },
  {
    path: 'artists-map',
    component: ArtistsMapComponent,
  },
];
