import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Photo } from '@capacitor/camera';
import { Observable, BehaviorSubject } from 'rxjs';
import { Foto } from '../interfaces/foto';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadString,
} from '@angular/fire/storage';
import { UserInterface } from '../interfaces/user';
import { addDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private dataRefPhotos = collection(this.firestore, 'fotos');
  private dataRefUsers = collection(this.firestore, 'users');
  public fecha: string = this.formatDate(new Date());

  // Define un BehaviorSubject para notificar cambios en la lista de fotos
  private fotosSubject = new BehaviorSubject<Foto[]>([]);
  fotos$ = this.fotosSubject.asObservable();
  private newPhotoSubject = new BehaviorSubject<void>(undefined);

  constructor(
    private storage: Storage,
    private firestore: Firestore,
    private auth: AuthService
  ) {}

  async subirImg(cameraFile: Photo, fotoType: string): Promise<string | null> {
    const timestamp = Date.now();
    const path = `fotos/${fotoType}-${this.auth.getCurrentUserEmail()}-${
      this.fecha
    }-${timestamp}.jpeg`;

    const storageRef = ref(this.storage, path);

    try {
      await uploadString(storageRef, cameraFile?.base64String || '', 'base64');
      const imageUrl = await getDownloadURL(storageRef);

      const foto: Foto = {
        url: imageUrl,
        user: this.auth.getCurrentUserEmail() || '',
        tipo: fotoType,
        fecha: this.fecha,
        votes: [],
      };

      await addDoc(this.dataRefPhotos, foto);
      this.newPhotoSubject.next();

      return imageUrl;
    } catch (e) {
      console.error('Error uploading image:', e);
      return null;
    }
  }

  traer(): Observable<Foto[]> {
    const users = this.dataRefPhotos;
    return collectionData(users, { idField: 'id' }) as Observable<[]>;
  }

  traerFotosUsuario(email: string): Observable<Foto[]> {
    const userPhotosQuery = query(
      this.dataRefPhotos,
      where('user', '==', email)
    );

    return new Observable<Foto[]>((observer) => {
      const unsubscribe = onSnapshot(
        userPhotosQuery,
        (snap) => {
          const fotos: Foto[] = [];
          snap.forEach((doc) => {
            const one = { id: doc.id, ...doc.data() } as Foto;
            fotos.push(one);
          });
          observer.next(fotos);
        },
        (error) => {
          console.error('Error al obtener fotos del usuario:', error);
          observer.error(error);
        }
      );

      // Cleanup function
      return () => unsubscribe();
    });
  }

  async votePhoto(photo: Foto, user: UserInterface) {
    if (user) {
      const docsPhoto = doc(this.dataRefPhotos, photo.id);
      await updateDoc(docsPhoto, { votes: photo.votes });
      const docsUser = doc(this.dataRefUsers, user.id);
      await updateDoc(docsUser, { votos: user.votos });

      // Notificar el cambio en la lista de fotos
      this.notifyFotosChange();
    }
  }

  notifyFotosChange() {
    const userEmail = this.auth.getCurrentUserEmail();
    if (userEmail) {
      this.traerFotosUsuario(userEmail).subscribe((fotos) => {
        this.fotosSubject.next(fotos);
      });
    }
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes} hs`;
  }
}
