import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form as signalForm, FormField } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormField],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginModel = signal({
    username: '',
    password: ''
  });
  
  loginForm = signalForm(this.loginModel);
  errorMessage = signal<string>('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    console.log('onLogin called');
    const formValue = this.loginModel();
    console.log('Form values:', formValue);
    
    if (!formValue.username || !formValue.password) {
      this.errorMessage.set('Bitte geben Sie Benutzername und Passwort ein.');
      return;
    }

    this.errorMessage.set('');
    
    console.log('Starting OAuth login...');
    await this.authService.login();
    console.log('OAuth login initiated');
  }
}
