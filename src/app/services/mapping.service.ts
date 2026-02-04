import { Injectable } from '@angular/core';
import {Employee} from "../model/Employee";
import {EmployeePutDto} from "../model/employee-put-dto";

@Injectable({
  providedIn: 'root',
})
export class MappingService {
  public MapEmployeeToEmployeePutDto(employee: Employee): EmployeePutDto {
    return new EmployeePutDto(employee.lastName,
      employee.firstName,
      employee.street,
      employee.postcode,
      employee.city,
      employee.phone,
      employee.skillSet.map(q => q.id));
  }
}
