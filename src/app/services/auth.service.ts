import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  
  userActive : any;

  constructor(private auth: Auth, private router: Router) { }
  

  async Login(email : string, password : string){
    return await signInWithEmailAndPassword(this.auth, email, password)
  
  }

  async Register(email : string, password : string) {
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }

  getUser() {
    return this.userActive;
  }

  getUserEmail(){
    return this.userActive.email;
  }



  logout() {
    this.auth.signOut().then(() => this.router.navigate(['login']));
  }
}
