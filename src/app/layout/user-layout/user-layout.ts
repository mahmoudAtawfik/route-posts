import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../share/navbar/navbar';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
export class UserLayout {}
