import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Auth } from '../../../core/auth/services/auth/auth';
import { Router, RouterLink } from '@angular/router';
import { AboutRoute } from '../about-route/about-route';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, AboutRoute ,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
   private readonly auth=inject(Auth)
   private readonly router=inject(Router)

  registerFormGroup=new FormGroup({
    name:new FormControl("" , [Validators.required , Validators.minLength(2) , Validators.maxLength(30)]),
    username:new FormControl("" , [Validators.minLength(3) , Validators.maxLength(30)]),
    email:new FormControl("" , [Validators.required , Validators.email]),
    dateOfBirth:new FormControl("" , Validators.required),
    gender:new FormControl("" , Validators.required),
    password:new FormControl("" , [Validators.required , Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=\S+$).{6,}$/)]),
    rePassword:new FormControl("" ),
  }, { validators: this.patternmatch } )
  passconfirm=signal("")
  successMsg=signal("")
  errorMsg=signal("")
  patternmatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const rePassword = control.get('rePassword');

    if (
      password &&
      rePassword &&
      password.value !== rePassword.value &&
      rePassword.touched
    ) {
      return { mismatch: true };
    }

    return null;
  }

  login(){
// console.log(this.registerFormGroup);
   if(this.registerFormGroup.valid ){
    this.errorMsg.set("")
    console.log("yes" , this.registerFormGroup.value);
     this.auth.register(this.registerFormGroup.value).subscribe(
      {
        next:(res)=>{console.log(res);
          this.successMsg.set(res.message) ;
          this.router.navigate(['/login'])

        },
        error:(err)=>{console.log(err);
          this.errorMsg.set(err.error.message);
          console.log(this.errorMsg());

        }
      }
     )
   }else{
  this.registerFormGroup.markAllAsTouched()

   }

  }
}
