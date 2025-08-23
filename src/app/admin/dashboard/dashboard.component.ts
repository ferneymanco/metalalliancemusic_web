import { Component } from '@angular/core';
import { EditorShellComponent } from '../../../libs/quill/editor-shell.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [EditorShellComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
