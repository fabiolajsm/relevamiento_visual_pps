import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ImageService } from '../services/image.service';
import { AuthService } from '../services/auth.service';
import { Foto } from '../interfaces/foto';
import { Subscription } from 'rxjs';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    NgxSpinnerModule,
  ],
})
export class Tab3Page implements OnInit, OnDestroy {
  fotos: Foto[] = [];
  private fotoSubscription: Subscription | undefined;
  private nuevaFotoSubscription: Subscription | undefined;

  constructor(
    private imageService: ImageService,
    private auth: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    if (this.auth.getCurrentUserEmail()) {
      this.spinner.show();
      this.fotoSubscription = this.imageService.fotos$.subscribe((fotos) => {
        this.fotos = fotos;
      });

      this.imageService.notifyFotosChange();
    }

    this.nuevaFotoSubscription = this.imageService
      .onUploadNewPhoto()
      .subscribe(() => {
        this.imageService.notifyFotosChange();
        this.spinner.hide();
      });
  }

  ngOnDestroy(): void {
    if (this.fotoSubscription) {
      this.fotoSubscription.unsubscribe();
    }

    if (this.nuevaFotoSubscription) {
      this.nuevaFotoSubscription.unsubscribe();
    }
  }
}
