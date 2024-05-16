import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginStatus!: string;

  constructor(private authService: AuthService, private router:Router) {
  }
  onLogin(data: any) {
    const username = data.username;
    const password = data.password;
    this.authService.login(username, password).subscribe(
    response => {
      this.loginStatus = 'Login Successfully!';
      console.log('Login successful:', response);
      this.router.navigateByUrl('/dashboard');
    },
    error => {
      console.error('Login failed:', error);
      this.loginStatus = error;
    });
  }

}
