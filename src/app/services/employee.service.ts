import { Injectable } from '@angular/core';
import {catchError, map, Observable, throwError} from "rxjs";
import {Employee} from "../model/Employee";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {EmployeePutDto} from "../model/employee-put-dto";
import {MappingService} from "./mapping.service";
import {EmployeeGetDto} from "../model/employee-get-dto";

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {

  constructor(private http: HttpClient, private authService: AuthService, private mappingService: MappingService) {
  }

  getEmployees(): Observable<Employee[]> {
    const token = this.authService.getAccessToken();
    return this.http.get<EmployeeGetDto[]>('http://localhost:8089/employees', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).pipe(map(eArray => {
      return eArray.map(e => {
        return new Employee(e.id, e.lastName, e.firstName, e.street, e.postcode, e.city, e.phone, e.skillSet);
      })
    }));
  }
  getEmployee(id: number): Observable<Employee> {
    const token = this.authService.getAccessToken();
    return this.http.get<Employee>('http://localhost:8089/employees/' + id, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).pipe(map(e => {
      return new Employee(e.id, e.lastName, e.firstName, e.street, e.postcode, e.city, e.phone, e.skillSet);
    }));
  }
  postEmployee(employee: Employee): Observable<Employee> {
    const token = this.authService.getAccessToken();
    let dto = this.mappingService.MapEmployeeToEmployeePutDto(employee);
    return this.http.post<Employee>('http://localhost:8089/employees',
      dto,
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${token}`)
      });
  }
  putEmployee(employee: Employee): Observable<Employee> {
    const token = this.authService.getAccessToken();
    let dto = this.mappingService.MapEmployeeToEmployeePutDto(employee);
    return this.http.put<Employee>('http://localhost:8089/employees/' + employee.id,
      dto,
      {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    });
  }
  deleteEmployee(employee: Employee): Observable<any> {
    const token = this.authService.getAccessToken();
    let dto = this.mappingService.MapEmployeeToEmployeePutDto(employee);
    return this.http.delete('http://localhost:8089/employees/' + employee.id,
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${token}`)
      });
  }
}
