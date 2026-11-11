import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth/services/auth/auth';
import { AboutRoute } from '../about-route/about-route';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, AboutRoute, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(Auth)
  private readonly router = inject(Router)

  loginFormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=\S+$).{6,}$/)]),
  })
  token = signal("")
  successMsg = signal("")
  errorMsg = signal("")

  login() {
    // console.log(this.registerFormGroup);
    if (this.loginFormGroup.valid) {
      this.errorMsg.set("")
      console.log("yes", this.loginFormGroup.value);
      this.auth.login(this.loginFormGroup.value).subscribe(
        {
          next: (res) => {
            console.log(res);
            this.successMsg.set(res.message);
            localStorage.setItem('authToken', res.data.token)
            localStorage.setItem('socialUser', JSON.stringify(res.data.user))
            this.router.navigate(['/feed'])

          },
          error: (err) => {
            console.log(err);
            this.errorMsg.set(err.error.message);
          }
        }
      )
    } else {
      this.loginFormGroup.markAllAsTouched()
    }

  }
}
