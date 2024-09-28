import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FirebaseError } from 'firebase/app';
import { authErrors } from '../services/auth.errors';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
})
export class LoginPage {
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  errorMessage: string | undefined = undefined;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  handleSubmit() {
    this.spinner.show();
    if (this.form.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      this.spinner.hide();
      return;
    }

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.spinner.hide();
        this.errorMessage = undefined;
        this.router.navigateByUrl('');
        this.form.controls['email'].setValue('');
        this.form.controls['password'].setValue('');
      },
      error: (err: FirebaseError) => {
        let errorMessage = 'Se produjo un error desconocido.';
        for (const error of authErrors) {
          if (error.code === err.code) {
            errorMessage = error.message;
            break;
          }
        }
        this.errorMessage = errorMessage;
        this.spinner.hide();
      },
    });
  }

  handleQuickAccess(email: string, password: string) {
    this.form.controls['email'].setValue(email);
    this.form.controls['password'].setValue(password);
  }
}
