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
  private nuevaFotoSubscription?: Subscription;
  public isLoading = false;

  constructor(
    private imageService: ImageService,
    private auth: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadUserPhotos();
    this.subscribeToNewPhotos();
  }

  private loadUserPhotos() {
    this.isLoading = true;
    this.spinner.show();

    const userEmail = this.auth.getCurrentUserEmail();
    if (userEmail) {
      this.imageService.traerFotosUsuario(userEmail).subscribe({
        next: (fotos) => {
          this.fotos = fotos;
          this.isLoading = false;
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Error loading user photos:', error);
          this.isLoading = false;
          this.spinner.hide();
        },
      });
    } else {
      this.isLoading = false;
      this.spinner.hide();
    }
  }

  private subscribeToNewPhotos() {
    this.nuevaFotoSubscription = this.imageService
      .onUploadNewPhoto()
      .subscribe(() => {
        this.loadUserPhotos();
      });
  }

  ngOnDestroy(): void {
    this.nuevaFotoSubscription?.unsubscribe();
  }
}
