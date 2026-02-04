import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  Signal,
  viewChild,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {Qualification} from "../model/qualification";
import {QualificationsDataService} from "../services/qualificationsData.service";
import {FormField, form} from "@angular/forms/signals";
import { ConfirmationPopupComponent } from "../confirmation-popup/confirmation-popup.component";
import {catchError} from "rxjs";
import {QualificationsApi} from "../services/qualificationsApi";
import {MatFormField, MatLabel} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {ComboboxComponent} from "../components/combobox/combobox.component";

@Component({
  selector: 'app-qualification-list',
  imports: [
    FormField,
    ConfirmationPopupComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    ComboboxComponent
  ],
  templateUrl: './qualification-list.component.html',
  styleUrl: './qualification-list.component.css',
})
export class QualificationListComponent {
  protected allQualifications = signal<Qualification[]>([]);

  private confirmationPopUp = viewChild.required(ConfirmationPopupComponent);
  private qualificationToEdit: WritableSignal<Qualification>;

  public qualifications = input.required<Qualification[]>();
  public canUpdateQualifications = input<boolean>(false);

  protected missingQualifications = computed(() => {
    return this.allQualifications()
      .filter(q => this.qualifications().findIndex(q2 => q.id == q2.id) == -1)
      .map(q => q.skill);
  });

  public qualificationForm;
  public newQualificationForm;
  public newQualification: WritableSignal<Qualification>;
  public addNewQualification = false;
  public popUpText =  signal("Das sollte hier nicht stehen");

  public newQualificationEvent = output<Qualification>();
  public selectQualificationEvent = output<Qualification>();
  public updateQualificationEvent = output<Qualification>();
  public deleteQualificationEvent = output<Qualification>();

  constructor(private qualificationsApi: QualificationsApi) {
    this.qualificationToEdit = signal({id: -1, skill: ""})
    this.qualificationForm = form(this.qualificationToEdit);
    this.newQualification = signal({id: -1, skill: ""})
    this.newQualificationForm = form(this.newQualification);

    this.fetchAllQualifications();
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

  startEdit(qualification: Qualification) {
    this.qualificationToEdit = signal(qualification);
    this.qualificationForm.skill().value.set(qualification.skill)
    this.qualificationForm.id().value.set(qualification.id)
  }

  newSkillInputChanged(input: string) {
    console.log("got info: " + input);
    this.newQualification().skill = input;
  }

  isEditQualification(qualification: Qualification) {
    if(this.qualificationToEdit() === qualification) {
      return true;
    } else {
      return false;
    }
  }

  saveEdit() {
    this.qualificationToEdit().skill = this.qualificationForm.skill().value()
    const index = this.qualifications().findIndex(qualification => this.qualificationToEdit().id === qualification.id)
    this.qualifications()[index] = this.qualificationToEdit()

    this.updateQualificationEvent.emit(this.qualificationToEdit());

    this.qualificationToEdit = signal({id: -1, skill: ""})
  }

  startAddNewQualification() {
    this.addNewQualification = true;
  }

  saveNew() {
    // this.newQualification().skill = this.newQualificationForm.skill().value();

    console.log(this.newQualification());

    const existing = this.allQualifications().find(q => q.skill === this.newQualification().skill);
    if (existing == undefined) {
      this.newQualificationEvent.emit(this.newQualification());
    }
    else {
      this.selectQualificationEvent.emit(existing);
    }

    this.addNewQualification = false;
    this.newQualificationForm.skill().value.set("")
  }

  abortNew() {
    this.addNewQualification = false;
    this.newQualificationForm.skill().value.set("")
  }

  deleteQualification(qualificationToDelete: Qualification) {
    const index = this.qualifications()?.findIndex(qualification => qualification.id === qualificationToDelete.id)
    this.qualifications().splice(index, 1);
    this.deleteQualificationEvent.emit(qualificationToDelete);
  }

  openDeletePopup(qualification: Qualification) {
    this.confirmationPopUp().showMessage("Sicher das du das Löschen willst?", () => this.deleteQualification(qualification));
  }

  cancelNew() {
    this.confirmationPopUp().showMessage("Sicher das du das erstellen Abbrechen willst?", () => this.abortNew());
  }

}
