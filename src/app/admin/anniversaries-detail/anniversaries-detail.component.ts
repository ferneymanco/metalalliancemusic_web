import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

import { Efemerides } from '../../../types/efemerides.data';

import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from 'firebase/firestore';

import { uuidv4 } from '../../../libs/uuid.utils';
import { toYYYYMMDD } from '../../../libs/date-utils';
import {
  notBlankValidator,
  notFutureDateValidator,
} from '../../../libs/validators.utils';

@Component({
  selector: 'app-anniversaries-detail',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TextFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
  templateUrl: './anniversaries-detail.component.html',
  styleUrl: './anniversaries-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnniversariesDetailComponent {
  private fb = inject(FormBuilder);

  public anniversaries: Efemerides = {
    title: '',
    date: '',
    description: '',
  };

  constructor(private firestore: Firestore) {}

  form = this.fb.group({
    date: this.fb.control<string | null>(null, {
      validators: [Validators.required, notFutureDateValidator],
    }),
    title: this.fb.control('', {
      validators: [
        Validators.required,
        notBlankValidator,
        Validators.minLength(3),
        Validators.maxLength(200),
      ],
    }),
    description: this.fb.control('', {
      validators: [Validators.maxLength(1000)],
    }),
  });

  get date() {
    return this.form.controls.date;
  }
  get title() {
    return this.form.controls.title;
  }
  get description() {
    return this.form.controls.description;
  }

  async saveDoc() {
    console.log('LOG > Saving document:', this.anniversaries.date);
    console.log('LOG > date-tiping:', typeof this.anniversaries.date);
    await setDoc(doc(this.firestore, 'anniversaries', uuidv4()), {
      date: this.anniversaries.date,
      title: this.anniversaries.title,
      description: this.anniversaries.description,
    });
  }

  clickSave = () => {
    const { date, title, description } = this.form.value;

    this.anniversaries.date = toYYYYMMDD(date) ?? '';
    this.anniversaries.title = title ?? '';
    this.anniversaries.description = description ?? '';
    this.saveDoc()
      .then(() => {
        console.log('LOG > Document successfully written!');
      })
      .catch((error) => {
        console.error('LOG > Error writing document: ', error);
      });
  };
}
