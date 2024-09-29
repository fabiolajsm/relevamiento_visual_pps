import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
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

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private dataRefPhotos = collection(this.firestore, 'fotos');
  private dataRefUsers = collection(this.firestore, 'users');
  public fecha: Date = new Date();

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
    const path = `fotos/${fotoType}-${this.auth.getCurrentUserEmail()}-${this.formatDate(
      this.fecha
    )}.jpeg`;
    const storageRef = ref(this.storage, path);

    try {
      await uploadString(storageRef, cameraFile?.base64String || '', 'base64');

      const imageUrl = await getDownloadURL(storageRef);

      const foto: Foto = {
        id: '',
        url: imageUrl,
        user: this.auth.getCurrentUserEmail() || '',
        tipo: fotoType,
        fecha: this.formatDate(this.fecha).toString(),
        votes: [],
      };

      const docRef = doc(this.dataRefPhotos);
      foto.id = docRef.id;

      await setDoc(docRef, foto);

      // Notifica sobre la nueva foto
      this.newPhotoSubject.next();

      return imageUrl;
    } catch (e) {
      console.error('Error uploading image:', e);
      return null;
    }
  }

  onUploadNewPhoto(): Observable<void> {
    return this.newPhotoSubject.asObservable();
  }

  // traer(): Observable<Foto[]> {
  //   return new Observable<Foto[]>((observer) => {
  //     onSnapshot(this.dataRefPhotos, (snap) => {
  //       const fotos: Foto[] = [];
  //       snap.docChanges().forEach((x) => {
  //         const one = x.doc.data() as Foto;
  //         fotos.push(one);
  //       });
  //       observer.next(fotos);
  //     });
  //   });
  // }

  traer(): Observable<Foto[]> {
    const users = this.dataRefPhotos;
    return collectionData(users, { idField: 'id' }) as Observable<[]>;
  }

  traerFotosUsuario(email: string): Observable<Foto[]> {
    const userPhotosQuery = query(
      this.dataRefUsers,
      where('users', '==', email),
      orderBy('fecha', 'desc') // Esto necesita un índice
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

  private formatDate(date: Date): string {
    date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
