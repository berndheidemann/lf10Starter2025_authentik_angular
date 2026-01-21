import {Component, inject, input, signal, Signal, WritableSignal} from '@angular/core';
import {Qualification} from "../model/qualification";
import {QualificationsDataService} from "../services/qualificationsData.service";
import {FormField, form} from "@angular/forms/signals";

@Component({
  selector: 'app-qualification-list',
  imports: [
    FormField
  ],
  templateUrl: './qualification-list.component.html',
  styleUrl: './qualification-list.component.css',
})
export class QualificationListComponent {
  public qualifications: Signal<Qualification[]>;
  private qualificationToEdit: WritableSignal<Qualification>;
  public qualificationForm;
  public newQualificationForm;
  public newQualification: WritableSignal<Qualification>;
  public addNewQualification = false;

  constructor(private qualificationsDataService: QualificationsDataService) {
    this.qualifications = this.qualificationsDataService.getQualifications();
    this.qualificationToEdit = signal({id: -1, skill: ""})
    this.qualificationForm = form(this.qualificationToEdit);
    this.newQualification = signal({id: -1, skill: ""})
    this.newQualificationForm = form(this.newQualification);
  }

  startEdit(qualification: Qualification) {
    this.qualificationToEdit = signal(qualification);
    this.qualificationForm.skill().value.set(qualification.skill)
    this.qualificationForm.id().value.set(qualification.id)
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
    this.qualificationsDataService.updateQualification(this.qualificationToEdit().id, this.qualificationToEdit().skill)
    this.qualificationToEdit = signal({id: -1, skill: ""})
  }

  startAddNewQualification() {
    this.addNewQualification = true;
  }

  saveNew() {
    this.newQualification().skill = this.newQualificationForm.skill().value();
    this.qualifications()?.push(this.newQualification())
    this.qualificationsDataService.postNewQualification(this.newQualification().skill);
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
    this.qualificationsDataService.deleteQualification(qualificationToDelete);
  }
}
