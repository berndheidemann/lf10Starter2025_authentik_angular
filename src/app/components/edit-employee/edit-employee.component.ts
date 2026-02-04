import {Component, computed, inject, signal, viewChild} from '@angular/core';
import {form, FormField, required, email, pattern} from '@angular/forms/signals'
import {Employee} from "../../model/Employee";
import {EmployeeService} from "../../services/employee.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../../auth.service";
import {catchError, EMPTY, firstValueFrom, Observable, of, throwError} from "rxjs";
import {AsyncPipe, NgClass} from "@angular/common";
import {EmployeePutDto} from "../../model/employee-put-dto";
import {Qualification} from "../../model/qualification";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {QualificationListComponent} from "../../qualification-list/qualification-list.component";
import {QualificationsPageComponent} from "../qualifications-page/qualifications-page.component";
import {QualificationsApi} from "../../services/qualificationsApi";
import {PostQualificationDTO} from "../../model/postQualificationDTO";
import {QualificationDto} from "../../model/QualificationDto";
import {ConfirmationPopupComponent} from "../../confirmation-popup/confirmation-popup.component";


@Component({
  selector: 'app-edit-employee',
  imports: [FormField, AsyncPipe, RouterLink, QualificationListComponent, QualificationsPageComponent, NgClass, ConfirmationPopupComponent],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.css',
})
export class EditEmployeeComponent {
  NULLEMPLOYEE : Employee = new Employee(-1, '', '', '', '', '', '', new Array<Qualification>);

  private confirmationPopUp = viewChild.required(ConfirmationPopupComponent);
  employee = signal<Employee>(this.NULLEMPLOYEE);
  allQualifications = signal<Qualification[]>([]);

  employeeForm = form(this.employee, (schemaPath) => {
    required(schemaPath.firstName, {message: "Vorname muss ausgefüllt sein"});
    required(schemaPath.lastName, {message: "Nachname muss ausgefüllt sein"});
    required(schemaPath.street, {message: "Straße muss ausgefüllt sein"});
    required(schemaPath.postcode, {message: "PLZ muss ausgefüllt sein"});
    pattern(schemaPath.postcode, /^\d{5}$/, {
      message: "PLZ muss genau 5 Ziffern enthalten"
    });
    required(schemaPath.city, {message: "Ort muss ausgefüllt sein"});
    required(schemaPath.phone, {message: "Telefon muss ausgefüllt sein"});
  });
  id: number = -1;
  unsavedChanges = false;
  attemptedSave = signal<boolean>(false);

  canSave = computed<boolean>(() => {
      return this.employeeForm().invalid() && (this.employeeForm().touched() || this.attemptedSave());
    }
  )

  nameLength = computed(() => {
    return this.employeeForm.firstName;
  });
  isNew() { return this.id === -1; }

  constructor(private employeeService: EmployeeService,
              private qualificationsApi: QualificationsApi,
              private router: Router,
              private route: ActivatedRoute) {
    const pathId = this.route.snapshot.paramMap.get('id');
    if (pathId != null && !Number.isNaN(parseInt(pathId, 10))) {
      this.id = parseInt(pathId, 10);
    }
    console.log(this.id);

    this.fetchEmployee();
    this.fetchAllQualifications();
  }

  consoleLog() {
    console.log("Hello World");
  }

  fetchEmployee(callback?: () => void) {
    if (this.isNew()) {
      this.employee.set(this.NULLEMPLOYEE);
    }
    else {
      this.employeeService.getEmployee(this.id)
        .pipe(catchError((err) => {
          // TODO: error message

          return EMPTY;
        }))
        .subscribe((s) => {
          this.employee.set(s);
          callback?.();
        });
    }
  }
  fetchAllQualifications(callback?: () => void) {
    return this.qualificationsApi.getAllQualifications()
      .pipe(catchError((err) => {
        // TODO: error message

        return [];
      }))
      .subscribe(q => {
        this.allQualifications.set(q)
        callback?.();
      });
  }

  save() {
    if (this.employeeForm().invalid()) {
      this.attemptedSave.set(true);
      return;
    }

    if (this.isNew()) {
      this.saveNew();
      return;
    }

    console.log("save");

    this.employeeService.putEmployee(this.employee()).subscribe({
      next: (response) => {
        console.log('Response vom Backend:', response);
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        switch (err.error.message) {
          case "Postcode must have 5 characters":
            this.confirmationPopUp().showMessage("Die PLZ muss aus 5 Nummern bestehen." , () => {});
            break;
          default:
            this.confirmationPopUp().showMessage(err.error.message , () => {});
            break;
        }

        console.error('Fehler:', err);
      }
    });
  }
  saveNew() {
    console.log("saveNew");

    this.employeeService.postEmployee(this.employee()).subscribe({
      next: (response) => {
        console.log('Response vom Backend:', response);

        this.id = response.id;
        this.employee.set(response);
      },
      error: (err) => {
        switch (err.error.message) {
          case "EmployeeEntity already exists":
            this.confirmationPopUp().showMessage("Den angelegten Mitarbeiter gibt es bereits." , () => {});
            break;
          case "Postcode must have 5 characters":
            this.confirmationPopUp().showMessage("Die PLZ muss aus 5 Nummern bestehen." , () => {});
            break;
          default:
            this.confirmationPopUp().showMessage(err.error.message , () => {});
            break;
        }

        console.error('Fehler:', err);
      }
    })
  }

  cancel() {
    this.confirmationPopUp().showMessage("Sind Sie sicher, dass Sie ihre Änderungen verwerfen möchten?",
      () => this.router.navigate(['/employees']));
  }
  delete() {
    console.log(this.isNew());
    if (this.isNew())  {
      this.cancel();
      return;
    }

    this.confirmationPopUp().showMessage("Sind Sie sicher, dass Sie diesen Mitarbeiter löschen wollen?",
      () => {
        this.employeeService.deleteEmployee(this.employee()).subscribe(() => {
          this.router.navigate(['/employees']);
      })
    });
  }

  onNewQualificationEvent(qualification: Qualification) {
    if (qualification.skill === "") {
      console.log("empty");
      return;
      // TODO: message box
      // TODO: validation??
    }

    // TODO: message box: wollen wie eine neue Qualifikation hinzufügen
    this.qualificationsApi.postQualification(qualification.skill)
      .pipe(catchError((err) => {
        // TODO: error message

        return of(new PostQualificationDTO(""));
      }))
      .subscribe((dto) => {
        if (dto.skill != "") {
          this.fetchAllQualifications(() => {
            const newEntry = this.allQualifications().find(q => q.skill === qualification.skill);

            if (newEntry != undefined) {
              this.employee().skillSet.push(newEntry);
            }
          })
        }
    })
  }

  onSelectQualification(qualification: Qualification) {
    this.employee().skillSet.push(qualification);
    this.unsavedChanges = true;
  }

  onDeleteQualification(qualification: Qualification) {
    this.employee().skillSet = this.employee().skillSet.filter(q => q.id != qualification.id);
  }
}
