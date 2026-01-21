import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Skill } from '../model/Skill';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  // TODO: Später durch echte API ersetzen, wenn Qualifikations-Feature verfügbar ist
  private mockSkills: Skill[] = [
    { id: 1, name: 'Java', description: 'Java Programmierung' },
    { id: 2, name: 'Python', description: 'Python Entwicklung' },
    { id: 3, name: 'JavaScript', description: 'JavaScript/TypeScript' },
    { id: 4, name: 'C#', description: 'C# .NET Entwicklung' },
    { id: 5, name: 'SQL', description: 'Datenbankentwicklung' },
    { id: 6, name: 'Angular', description: 'Angular Framework' },
    { id: 7, name: 'React', description: 'React Framework' },
    { id: 8, name: 'Docker', description: 'Container-Technologie' },
    { id: 9, name: 'Kubernetes', description: 'Container-Orchestrierung' },
    { id: 10, name: 'AWS', description: 'Amazon Web Services' },
    { id: 11, name: 'Azure', description: 'Microsoft Azure' },
    { id: 12, name: 'DevOps', description: 'DevOps Praktiken' },
    { id: 13, name: 'Scrum', description: 'Agile Methodik' },
    { id: 14, name: 'Git', description: 'Versionskontrolle' },
    { id: 15, name: 'REST API', description: 'RESTful API Design' }
  ];

  constructor() {}

  /**
   * Holt alle verfügbaren Skills
   * TODO: Später durch HTTP-Call ersetzen: this.http.get<Skill[]>('http://localhost:8089/skills')
   */
  getSkills(): Observable<Skill[]> {
    return of(this.mockSkills);
  }

  /**
   * Holt einen Skill anhand der ID
   */
  getSkillById(id: number): Observable<Skill | undefined> {
    const skill = this.mockSkills.find(s => s.id === id);
    return of(skill);
  }

  /**
   * Mappt Skill-IDs zu Skill-Namen
   */
  getSkillNamesByIds(ids: bigint[]): string[] {
    return ids
      .map(id => {
        const skill = this.mockSkills.find(s => s.id === Number(id));
        return skill ? skill.name : `#${id}`;
      });
  }

  /**
   * Holt alle eindeutigen Skill-Namen
   */
  getAllSkillNames(): string[] {
    return this.mockSkills.map(s => s.name).sort();
  }
}
