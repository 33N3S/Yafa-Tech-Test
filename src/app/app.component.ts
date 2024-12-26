import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeeListComponent } from "./views/employee-list/employee-list.component";
import { LoginComponent } from "./views/login/login.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, EmployeeListComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'test_yafa';
}
