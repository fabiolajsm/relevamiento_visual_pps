import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage {

  email: string = "";
  password : string = "";
  flagError : boolean = false;
  loggedUser: string = "";
  msjError : string = "";

  constructor(private router: Router, public auth : AuthService) {}

  LoginUser() {
    this.auth.Login(this.email, this.password).then((res) => {
      if (res.user.email !== null) this.auth.userActive = res.user;
      this.goTo("tabs")
      this.flagError = false;
      this.email ="";
      this.password = "";
    }).catch((e) => {

      this.flagError = true;

      switch(e.code) {
        case "auth/invalid-email":
          this.msjError = "Email invalido";
          break;
        case "auth/invalid-credential":
          this.msjError = "El email o contraseña son incorrectos";
          break;
        case "auth/missing-password":
          this.msjError = "Por favor introduzca una contraseña";
          break;
        case "auth/too-many-requests":
          this.msjError = "Por favor ingrese bien sus datos";
          break;
        default:
          this.msjError = e.code
          break;
      }
    });
  }

  Rellenar(email : string, password : string){
    this.email = email;
    this.password = password;
  }


  goTo(path : string)
  {
    this.router.navigate([path]);
  }

}
