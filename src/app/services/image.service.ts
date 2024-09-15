import { Injectable } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Photo } from '@capacitor/camera';
import { Observable, BehaviorSubject } from 'rxjs'; // Import BehaviorSubject
import { Foto } from '../interfaces/foto';
import { UserService } from './user.service';
import { Storage, getDownloadURL, ref, uploadString } from '@angular/fire/storage';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private dataRef = collection(this.firestore, 'fotos');
  private dataRefUsers = collection(this.firestore, 'usuarios');
  public fecha: Date = new Date();

  // Define un BehaviorSubject para notificar cambios en la lista de fotos
  private fotosSubject = new BehaviorSubject<Foto[]>([]);
  fotos$ = this.fotosSubject.asObservable();
  private nuevaFotoSubject = new BehaviorSubject<void>(undefined);

  constructor(private storage: Storage, private firestore: Firestore, private auth: AuthService, private userService: UserService) { }

  async subirImg(cameraFile: Photo, fotoType: string): Promise<string | null> {
    const path = `fotos/${fotoType}-${this.auth.userActive?.email}-${this.formatDate(this.fecha)}.jpeg`;
    const storageRef = ref(this.storage, path);

    try {
      await uploadString(
        storageRef,
        cameraFile?.base64String || '',
        'base64'
      );

      const imageUrl = await getDownloadURL(storageRef);

      const foto: Foto = {
        id: '',
        url: imageUrl,
        user: this.auth.userActive?.email || '',
        tipo: fotoType,
        fecha: this.formatDate(this.fecha).toString(),
        votes: [],
      };

      const docRef = doc(this.dataRef);
      foto.id = docRef.id;

      await setDoc(docRef, foto);

      // Notifica sobre la nueva foto
      this.nuevaFotoSubject.next();

      return imageUrl;
    } catch (e) {
      console.error('Error uploading image:', e);
      return null;
    }
  }

  onNuevaFoto(): Observable<void> {
    return this.nuevaFotoSubject.asObservable();
  }

  traer(): Observable<Foto[]> {
    return new Observable<Foto[]>((observer) => {
      onSnapshot(this.dataRef, (snap) => {
        const fotos: Foto[] = [];
        snap.docChanges().forEach(x => {
          const one = x.doc.data() as Foto;
          fotos.push(one);
        });
        observer.next(fotos);
      });
    });
  }

  traerFotosUsuario(email: string): Observable<Foto[]> {
    const userPhotosQuery = query(this.dataRef, where('user', '==', email), orderBy('fecha', 'desc'));
    return new Observable<Foto[]>((observer) => {
      onSnapshot(userPhotosQuery, (snap) => {
        const fotos: Foto[] = [];
        snap.docChanges().forEach(x => {
          const one = x.doc.data() as Foto;
          fotos.push(one);
        });
        observer.next(fotos);
      });
    });
  }

  async votePhoto(photo: Foto, user: User) {
    if (user) {
      const docsPhoto = doc(this.dataRef, photo.id);
      await updateDoc(docsPhoto, { votes: photo.votes });
      const docsUser = doc(this.dataRefUsers, user.id);
      await updateDoc(docsUser, { votos: user.votos });

      // Notificar el cambio en la lista de fotos
      this.notifyFotosChange();
    }
  }

  notifyFotosChange() {
    const userEmail = this.auth.userActive?.email;
    if (userEmail) {
      this.traerFotosUsuario(userEmail).subscribe(fotos => {
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
