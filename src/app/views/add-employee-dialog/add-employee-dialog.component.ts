import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';


@Component({
  selector: 'app-add-employee-dialog',
  standalone: true,
  imports: [
    MatInputModule,
    MatButton,
    ReactiveFormsModule
  ],
  templateUrl: './add-employee-dialog.component.html',
  styleUrl: './add-employee-dialog.component.css'
})
export class AddEmployeeDialogComponent {
  employeeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEmployeeDialogComponent>
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      position: ['', Validators.required],
      department: ['', Validators.required],
      hireDate: ['', Validators.required]
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
