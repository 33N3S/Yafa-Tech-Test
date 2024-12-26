import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Employee } from '../../services/employee.service';

@Component({
  selector: 'app-edit-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  template: `
    <h1 mat-dialog-title>Edit Employee</h1>
    <div mat-dialog-content>
      <form [formGroup]="employeeForm">
        <mat-form-field appearance="fill">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Position</mat-label>
          <input matInput formControlName="position" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department" />
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Hire Date</mat-label>
          <input matInput type="date" formControlName="hireDate" />
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button color="primary" (click)="onSubmit()" [disabled]="!employeeForm.valid">Update</button>
    </div>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 350px;
      padding: 16px 0;
    }

    mat-form-field {
      width: 100%;
    }

    .mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class EditEmployeeDialogComponent {
  employeeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditEmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee
  ) {
    this.employeeForm = this.fb.group({
      firstName: [data.firstName, Validators.required],
      lastName: [data.lastName, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      phone: [data.phone, Validators.required],
      position: [data.position, Validators.required],
      department: [data.department, Validators.required],
      hireDate: [new Date(data.hireDate).toISOString().split('T')[0], Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.dialogRef.close(this.employeeForm.value);
    }
  }
}