import {Component, signal, Signal, WritableSignal} from '@angular/core';
import {QualificationsDataService} from "../../services/qualificationsData.service";
import {Qualification} from "../../model/qualification";
import {QualificationListComponent} from "../../qualification-list/qualification-list.component";
import {QualificationsApi} from "../../services/qualificationsApi";

@Component({
  selector: 'app-qualifications-page',
  imports: [
    QualificationListComponent
  ],
  templateUrl: './qualifications-page.component.html',
  styleUrl: './qualifications-page.component.css',
})
export class QualificationsPageComponent {
  qualifications : WritableSignal<Qualification[]>;

  constructor(private qualificationsApi: QualificationsApi) {
    this.qualifications = signal<Qualification[]>([]);
    this.fetchQualifications();
  }

  private fetchQualifications() {
    try {
      this.qualificationsApi.getAllQualifications().subscribe(q => this.qualifications.set(q));
    }
    catch(e) {
      // TODO: message box
    }
  }

  onNewQualification(qualification: Qualification) {
    console.log(qualification);
    this.qualificationsApi.postQualification(qualification.skill).subscribe((dto) => {
      this.qualificationsApi.getAllQualifications().subscribe(array => {
        this.qualifications.set(array);
      })
    });
  }

  onUpdateQualification(qualification: Qualification) {
    const index = this.qualifications().findIndex(q => q.id == qualification.id);
    if (index != -1) {
      this.qualifications()[index].skill = qualification.skill;
    }

    try {
      this.qualificationsApi.updateQualification(qualification.id, qualification.skill).subscribe();
    }
    catch (e) {
      // TODO: message box

      this.fetchQualifications();
    }
  }

  onDeleteQualification(qualification: Qualification) {
    this.qualificationsApi.deleteQualification(qualification);
    this.fetchQualifications();
  }
}
