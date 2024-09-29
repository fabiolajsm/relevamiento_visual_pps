import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonToast,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ImageService } from '../services/image.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonToast,
    NgxSpinnerModule,
    CommonModule,
  ],
})
export class Tab1Page {
  uploadMessage: string = '';
  error: boolean = false;

  constructor(
    private imageService: ImageService,
    private auth: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  async handleNicePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      promptLabelHeader: 'Foto Linda',
      promptLabelPicture: 'Tomar Foto',
      promptLabelPhoto: 'Desde Galeria',
    });

    if (!image) return;
    this.spinner.show();

    const imageUrl = await this.imageService.subirImg(image, 'linda');
    this.uploadMessage =
      imageUrl !== null
        ? 'Foto linda subida exitosamente'
        : 'Error al subir foto, intente más tarde';
    this.error = imageUrl === null;

    this.spinner.hide();
  }

  async handleUglyPhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      promptLabelHeader: 'Foto Fea',
      promptLabelPicture: 'Tomar Foto',
      promptLabelPhoto: 'Desde Galeria',
    });

    if (!image) return;
    this.spinner.show();
    const imageUrl = await this.imageService.subirImg(image, 'fea');
    this.uploadMessage =
      imageUrl !== null
        ? 'Foto fea subida exitosamente'
        : 'Error al subir foto, intente más tarde';
    this.error = imageUrl === null;

    this.spinner.hide();
  }

  handleLogout() {
    this.auth.logout();
    this.router.navigateByUrl('login');
  }
}
