import { Component } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy } from '@angular/fire/firestore';
import { Efemerides } from '../../types/efemerides.data';
import { formatDateYYYYMMDD } from '../../libs/date-utils';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-efemerides',
  standalone: true,
  imports: [],
  templateUrl: './efemerides.component.html',
  styleUrl: './efemerides.component.scss'
})
export class EfemeridesComponent {

  public anniversaries: Efemerides = {
    title: '',
    date: '',
    description: ''}
  constructor(private firestore: Firestore, private sanitizer: DomSanitizer ) { }

  async ngOnInit() {
    const productosCollection = collection(this.firestore, 'anniversaries');

    const anniversariesQuery = query(productosCollection, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(anniversariesQuery);
    querySnapshot.forEach((doc) => {
      this.anniversaries = doc.data() as Efemerides;
      this.anniversaries = this.getAnniversaries(this.anniversaries);
        console.log(doc.id, ' => ', doc.data());
    });
  }

  getAnniversaries(anniversary: Efemerides): Efemerides {
    anniversary.date = formatDateYYYYMMDD(anniversary.date.slice(0,-2),true); // Formatear la fecha
    return anniversary;
  }

}
