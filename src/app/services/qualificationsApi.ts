import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {Qualification} from '../model/qualification';
import {PostQualificationDTO} from '../model/postQualificationDTO';
import {Injectable} from '@angular/core';
import {AuthService} from "../auth.service";

@Injectable({providedIn: "root"})
export class QualificationsApi {

  private baseUrl: string = "http://localhost:8089";

  constructor(private httpClient: HttpClient, private authService: AuthService) {
  }

  getAllQualifications(): Observable<Qualification[]> {
    const token = this.authService.getAccessToken();
    const apiUrl = `${this.baseUrl}/qualifications`;
    return this.httpClient.get<Qualification[]>(apiUrl,
      {headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    }).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  updateQualification(id: number, skill: string) {
    const token = this.authService.getAccessToken();
    const apiUrl = `${this.baseUrl}/qualifications/${id}`;
    this.httpClient.put(apiUrl, {skill: skill}, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`),
    }).pipe(catchError((err: HttpErrorResponse) => throwError(() => err)))
      .subscribe();
  }

  postQualification(skill: string) {
    const token = this.authService.getAccessToken();
    const apiUrl = `${this.baseUrl}/qualifications`;
    this.httpClient.post(apiUrl, {skill: skill}, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`),
    }).pipe(catchError((err: HttpErrorResponse) => throwError(() => err)))
      .subscribe();
  }

  deleteQualification(qualificationToDelete: Qualification) {
    const token = this.authService.getAccessToken();
    const apiUrl = `${this.baseUrl}/qualifications/${qualificationToDelete.id}`;
    this.httpClient.delete(apiUrl, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`),
    }).pipe(catchError((err: HttpErrorResponse) => throwError(() => err)))
      .subscribe();
  }

}
