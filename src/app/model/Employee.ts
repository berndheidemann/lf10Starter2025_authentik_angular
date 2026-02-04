import {Qualification} from "./qualification";

export class Employee {
  constructor(public id: number,
              public lastName: string,
              public firstName: string,
              public street: string,
              public postcode: string,
              public city: string,
              public phone: string,
              public skillSet: Qualification[] ) {
  }

  getFullName(): string {
    return this.firstName + " " + this.lastName;
  }
  getFullPhoneNumber(): string {
    return this.phone;
  }
  getFullAddress(): string {
    return this.street + ", " + this.postcode + " " + this.city;
  }
  getFullSkillDescription() {
    let output = "";
    this.skillSet.forEach(x => {
      if (output.length > 0) {
        output += ", ";
      }

      output += x.skill;
    })
    return output;
  }
}
