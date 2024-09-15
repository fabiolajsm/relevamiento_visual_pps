import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonCard, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import { ImageService } from '../services/image.service';
import { AuthService } from '../services/auth.service';
import { Foto } from '../interfaces/foto';
import { Subscribable, Subscription } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonIcon, IonCard, IonCol, IonRow, IonGrid, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, CommonModule],
})
export class Tab3Page implements OnInit, OnDestroy{
  
  fotos: Foto[] = [];
  private fotoSubscription: Subscription | undefined;
  private nuevaFotoSubscription: Subscription | undefined;

  constructor(private imageService: ImageService, private auth: AuthService) {}

  ngOnInit() {
    if (this.auth.userActive?.email) {
      this.fotoSubscription = this.imageService.fotos$.subscribe(fotos => {
        this.fotos = fotos;
      });

      this.imageService.notifyFotosChange();
    }

    this.nuevaFotoSubscription = this.imageService.onNuevaFoto().subscribe(() => {
      this.imageService.notifyFotosChange();
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