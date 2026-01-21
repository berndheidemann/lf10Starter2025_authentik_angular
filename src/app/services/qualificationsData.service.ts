import {Qualification} from "../model/qualification";
import {QualificationsApi} from "./qualificationsApi";
import {map} from "rxjs";
import {toSignal} from "@angular/core/rxjs-interop";
import {Injectable, Signal} from "@angular/core";

@Injectable({providedIn: "root"})
export class QualificationsDataService {
  private qualifications

  constructor(private qualificationApi: QualificationsApi) {
    this.qualifications = toSignal(this.qualificationApi.getAllQualifications(), {initialValue: []})
  }

  getQualifications() {
    return this.qualifications;
  }

  updateQualification(id: number, skill: string) {
    this.qualificationApi.updateQualification(id, skill);
  }

  postNewQualification(skill: string) {
    this.qualificationApi.postQualification(skill);
  }

  deleteQualification(qualificationToDelete: Qualification) {
    this.qualificationApi.deleteQualification(qualificationToDelete);
  }

}
