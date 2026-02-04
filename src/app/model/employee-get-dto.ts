import {Qualification} from "./qualification";

export class EmployeeGetDto {
  constructor(public id: number,
              public lastName: string,
              public firstName: string,
              public street: string,
              public postcode: string,
              public city: string,
              public phone: string,
              public skillSet: Qualification[] ) {
  }
}
