import { Component, OnDestroy, OnInit } from '@angular/core';
import { Foto } from '../interfaces/foto';
import { UserInterface } from '../interfaces/user';
import { ImageService } from '../services/image.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonTitle,
    IonButton,
    IonToolbar,
    IonContent,
    IonHeader,
    CommonModule,
    NgxSpinnerModule,
  ],
})
export class Tab2Page implements OnInit, OnDestroy {
  public fotos: Foto[] = [];
  public user: UserInterface | undefined | null;
  public isLoading: boolean = false;
  private getPhotosSub?: Subscription;
  private getUserSub?: Subscription;

  constructor(
    private imageService: ImageService,
    private auth: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    addIcons({ heart });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.spinner.show();

    // obtener fotos
    this.getPhotosSub = this.imageService.traer().subscribe((data) => {
      console.log(data, 'dataaa');
      
      this.fotos = data;
      this.ordenarPorFecha(this.fotos);
      this.isLoading = false;
      this.spinner.hide();
    });
    const userEmail = this.auth.getCurrentUserEmail() as string;
    if (userEmail) {
      this.getUserSub = this.auth.getUserByEmail(userEmail).subscribe(
        (user) => {
          this.user = user;
        },
        (error) => {
          console.error('Error al obtener el usuario:', error);
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.getPhotosSub?.unsubscribe();
    this.getUserSub?.unsubscribe();
  }

  ordenarPorFecha(fotos: Foto[]) {
    fotos.sort((a: Foto, b: Foto) => {
      const horaA = new Date(a.fecha);
      const horaB = new Date(b.fecha);
      return horaB.getTime() - horaA.getTime();
    });
  }

  async vote(photo: Foto, cardId: string) {
    if (!this.user) return;
    if (!photo.votes) {
      photo.votes = [];
    }
    if (!this.user.votos) {
      this.user.votos = [];
    }
    if (this.checkVotes(photo)) {
      photo.votes.push(this.user!.id);
      this.user.votos.push(photo.id);
    } else {
      const indice = photo.votes.indexOf(this.user!.id);
      if (indice !== -1) {
        photo.votes.splice(indice, 1);
        const indiceUser = this.user!.votos.indexOf(photo.id);
        if (indiceUser !== -1) {
          this.user!.votos.splice(indiceUser, 1);
        }
      }
    }

    await this.imageService.votePhoto(photo, this.user!);
    await this.updatePhotos();
  }

  checkVotes(photo: Foto): boolean {
    return !(
      this.user &&
      photo &&
      photo.votes &&
      photo.votes.includes(this.user.id)
    );
  }

  async updatePhotos() {
    this.spinner.show();
    this.imageService.traer().subscribe((data) => {
      this.fotos = data;
      this.ordenarPorFecha(this.fotos);
      this.spinner.hide();
    });
  }

  goToResults() {
    this.router.navigate(['resultados']);
  }
}
