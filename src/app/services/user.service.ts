import { Injectable } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, query, setDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  
  private dataRef = collection(this.firestore, 'usuarios');

  constructor(private firestore: Firestore) { }

  createUser(user: User) {
    if (user === null) return Promise.reject();
    const docs = doc(this.dataRef);
    user.id = docs.id;
    return setDoc(docs, user);
  }

  getUserByEmail(email: string): Observable<User | null> {
    return new Observable<User | null>((observer) => {
      const q = query(this.dataRef, where('email', '==', email));
      const unsubscribe = onSnapshot(q, (snap) => {
        let found = false;
        snap.forEach(doc => {
          const data = doc.data() as User;
          if (data.email === email) {
            found = true;
            observer.next(data);
          }
        });
        if (!found) {
          observer.next(null);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }
}
