import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { NgxSpinnerModule } from 'ngx-spinner';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet , NgxSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  ngOnInit(): void {
            initFlowbite();
  }
  protected readonly title = signal('social-app');
}
