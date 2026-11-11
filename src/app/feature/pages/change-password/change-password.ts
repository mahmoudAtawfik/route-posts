import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ProfilesServ } from '../../../core/user/services/profile/profiles-serv';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { mismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private readonly profilesService = inject(ProfilesServ);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = new FormGroup(
    {
      password: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])[^\s]{8,}$/
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator }
  );

  get passwordControl() {
    return this.form.get('password');
  }

  get newPasswordControl() {
    return this.form.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.form.get('confirmPassword');
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((v) => !v);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.form.value;
    const payload = {
      password: formValue.password,
      newPassword: formValue.newPassword,
    };

    this.profilesService.changePassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.successMessage.set('Password updated successfully!');

        const newToken = res?.token || res?.data?.token;
        if (newToken) {
          localStorage.setItem('authToken', newToken);
        }

        this.form.reset();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Error changing password:', err);
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          'Failed to update password. Please check your current password and try again.';
        this.errorMessage.set(msg);
      },
    });
  }
}
