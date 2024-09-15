import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SplashPage {
  constructor(public router: Router) {
    setTimeout(() => {
      this.router.navigateByUrl('login');
    }, 4000);
  }
}
