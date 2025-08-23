import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EfemeridesComponent } from './efemerides/efemerides.component';
import { ArtistsMapComponent } from './artists-map/artists-map.component';
import { AnniversariesDetailComponent } from './admin/anniversaries-detail/anniversaries-detail.component';

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
  {
    path: 'admin',
    component: AnniversariesDetailComponent,
  }
];
