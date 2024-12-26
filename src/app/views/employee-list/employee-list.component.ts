import { Component, OnInit } from '@angular/core';
import { Employee, EmployeeService } from '../../services/employee.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AddEmployeeDialogComponent } from '../add-employee-dialog/add-employee-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EditEmployeeDialogComponent } from '../edit-employee-dialog/edit-employee-dialog.component';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    HttpClientModule,
    MatSelect,
    MatOption,
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatTableModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phone', 'position', 'department', 'hireDate', 'actions'];
  searchText: string = '';
  selectedDepartment: string = '';
  departments: string[] = [];

  constructor(private employeeService: EmployeeService,private dialog: MatDialog, private authservice: AuthService,  private router: Router) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  onLogout(): void {
    localStorage.clear();
    this.router.navigate(['']); // Redirect to login page after logout
  }


  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
        // Extract unique departments
        this.departments = [...new Set(data.map(emp => emp.department))];
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.employees];

    // Apply search filter
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.position.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (this.selectedDepartment) {
      filtered = filtered.filter(emp => emp.department === this.selectedDepartment);
    }

    this.filteredEmployees = filtered;
  }

  onSearch(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onDepartmentChange(department: string) {
    this.selectedDepartment = department;
    this.applyFilters();
  }

  clearFilters() {
    this.searchText = '';
    this.selectedDepartment = '';
    this.applyFilters();
  }


  deleteEmployee(id: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe(() => {
        this.loadEmployees();
      });
    }
  }

  openAddEmployeeDialog(): void {
    const dialogRef = this.dialog.open(AddEmployeeDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const employee = {
          ...result,
          hireDate: new Date(result.hireDate).toISOString()
        };

        this.employeeService.createEmployee(employee).subscribe({
          next: (newEmployee) => {
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Error creating employee:', error);
          }
        });
      }
    });
  }


  openEditEmployeeDialog(employee: Employee): void {
    const dialogRef = this.dialog.open(EditEmployeeDialogComponent, {
      width: '500px',
      data: employee
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Convert the date format to match your backend expectations
        const updatedEmployee = {
          ...result,
          hireDate: new Date(result.hireDate).toISOString()
        };
  
        this.employeeService.updateEmployee(employee.id, updatedEmployee).subscribe({
          next: () => {
            this.loadEmployees(); // Refresh the list
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            // Handle error 
          }
        });
      }
    });
  }


}