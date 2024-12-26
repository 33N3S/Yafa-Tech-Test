import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees'; // Added '/api' prefix

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Employee[]>(this.apiUrl, { headers });
  }

  deleteEmployee(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  createEmployee(employee: Employee): Observable<Employee> {
    const headers = this.getAuthHeaders();
    return this.http.post<Employee>(this.apiUrl, employee, { headers });
  }

  updateEmployee(id: string, employee: Employee): Observable<Employee> {
    const headers = this.getAuthHeaders();
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}


