import { Component, OnDestroy, OnInit } from '@angular/core';
import { Foto } from '../interfaces/foto';
import { User } from '../interfaces/user';
import { ImageService } from '../services/image.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, IonCard, IonIcon, IonButton } from "@ionic/angular/standalone";
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonCard, IonCol, IonRow, IonGrid, IonTitle, IonToolbar, IonContent, IonHeader, IonIcon, IonButton, IonGrid, IonRow, IonCard, IonCol, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, CommonModule]
})
export class Tab2Page implements OnInit, OnDestroy{
  public fotos: Foto[] = [];
  public user: User | undefined | null;
  private focusedElementId?: string;
  private nuevaFotoSubscription: Subscription | undefined;

  constructor(
    private imageService: ImageService,
    private auth: AuthService,
    private userService: UserService,
    private loadingController: LoadingController,
    private router: Router
  ) {
    addIcons({heart})
  }

  ngOnInit(): void {
    this.loadPhotos();
    this.loadUser();

    // Suscribe al sujeto de nuevas fotos
    this.nuevaFotoSubscription = this.imageService.onNuevaFoto().subscribe(() => {
      this.loadPhotos(); // Actualiza la lista de fotos cuando se añade una nueva
    });
  }

  ngOnDestroy(): void {
    // Desuscribe al destruir el componente para evitar fugas de memoria
    if (this.nuevaFotoSubscription) {
      this.nuevaFotoSubscription.unsubscribe();
    }
  }

  async loadPhotos() {
    this.imageService.traer().subscribe((data) => {
      this.fotos = data;
      this.ordenarPorFecha(this.fotos);
    });
  }

  async loadUser() {
    const userEmail = this.auth.getUserEmail() as string;
    if (userEmail) {
      this.userService.getUserByEmail(userEmail).subscribe(
        (user) => {
          this.user = user;
        },
        (error) => {
          console.error('Error al obtener el usuario:', error);
        }
      );
    } else {
      console.error('No se ha proporcionado un email de usuario válido');
    }
  }

  ordenarPorFecha(fotos: Foto[]) {
    fotos.sort((a: Foto, b: Foto) => {
      const horaA = new Date(a.fecha);
      const horaB = new Date(b.fecha);
      return horaB.getTime() - horaA.getTime();
    });
  }

  async vote(photo: Foto, cardId: string) {
    console.log(photo);
    console.log(this.user);

    if (!photo.votes) {
      photo.votes = [];
    }

    if (!this.user?.votos) {
      this.user!.votos = [];
    }

    if (this.checkVotes(photo)) {
      console.log("Agregando like");
      photo.votes.push(this.user!.id);
      this.user!.votos.push(photo.id);
    } else {
      console.log("Sacando like");
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

    setTimeout(() => {
      this.presentLoading();
      const focusedCard = document.getElementById(cardId) as HTMLElement;
      if (focusedCard) {
        focusedCard.focus();
      }
    }, 100);
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      duration: 100,
    });
    await loading.present();
  }

  checkVotes(photo: Foto): boolean {
    return !(this.user && photo && photo.votes && photo.votes.includes(this.user.id));
  }

  async updatePhotos() {
    this.imageService.traer().subscribe(data => {
      this.fotos = data;
      this.ordenarPorFecha(this.fotos);
    });
  }

  goResultados() {
    this.router.navigate(['resultados']);
  }
}
