import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, Field } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Employee } from "../model/Employee";
import { EmployeeService } from "../services/employee.service";
import { QualificationsApi } from "../services/qualificationsApi";
import { Qualification } from "../model/qualification";
import { AuthService } from "../auth.service";

// Filterfelder für die Erweiterte Suche
interface FilterState {
  firstName: string;
  lastName: string;
  city: string;
  postcode: string;
  skill: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, Field],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {

  // Daten vom Backend
  private employeesSignal = signal<Employee[]>([]);
  private qualificationsSignal = signal<Qualification[]>([]);

  // UI-Zustände
  isLoading = signal(true);
  errorMessage = signal('');
  showFilterModal = signal(false);
  showQualDropdown = signal(false);

  // Erweiterte Suche – Signal Form (wird erst beim Klick "Filtern" angewendet)
  private filterModel = signal<FilterState>({
    firstName: '',
    lastName: '',
    city: '',
    postcode: '',
    skill: ''
  });
  filterForm = form(this.filterModel, () => {});

  // Aktive Filter – nur bei "Filtern" oder Qualifikationsklick aktualisiert
  activeFilters = signal<FilterState>({
    firstName: '',
    lastName: '',
    city: '',
    postcode: '',
    skill: ''
  });

  // Anzahl aktiver Textfilter (für Lupe-Badge)
  textFilterCount = computed(() => {
    const f = this.activeFilters();
    let count = 0;
    if (f.firstName.trim()) count++;
    if (f.lastName.trim()) count++;
    if (f.city.trim()) count++;
    if (f.postcode.trim()) count++;
    return count;
  });

  // Gefilterte Liste – kombiniert Textfilter und Qualifikation
  filteredEmployees = computed(() => {
    let employees = this.employeesSignal();
    const filters = this.activeFilters();

    // Textfilter anwenden
    if (filters.firstName.trim()) {
      employees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(filters.firstName.toLowerCase().trim())
      );
    }
    if (filters.lastName.trim()) {
      employees = employees.filter(emp =>
        emp.lastName.toLowerCase().includes(filters.lastName.toLowerCase().trim())
      );
    }
    if (filters.city.trim()) {
      employees = employees.filter(emp =>
        emp.city.toLowerCase().includes(filters.city.toLowerCase().trim())
      );
    }
    if (filters.postcode.trim()) {
      employees = employees.filter(emp =>
        emp.postcode.includes(filters.postcode.trim())
      );
    }

    // Qualifikationsfilter
    if (filters.skill.trim()) {
      employees = employees.filter(emp => {
        if (!emp.skillSet || emp.skillSet.length === 0) return false;
        return this.getSkillNames(emp).some(name =>
          name.toLowerCase().includes(filters.skill.toLowerCase().trim())
        );
      });
    }

    return employees;
  });

  constructor(
    private employeeService: EmployeeService,
    private qualificationsApi: QualificationsApi,
    private router: Router,
    private authService: AuthService
  ) {
    this.fetchData();
    this.fetchQualifications();
  }

  // Qualifikationen vom Backend laden
  fetchQualifications(): void {
    this.qualificationsApi.getAllQualifications().subscribe({
      next: (qualifications) => this.qualificationsSignal.set(qualifications),
      error: (err) => console.error('Fehler beim Laden der Qualifikationen:', err)
    });
  }

  // Qualifikationsnamen eines Mitarbeiters
  getSkillNames(employee: Employee): string[] {
    if (!employee.skillSet || employee.skillSet.length === 0) return [];
    return employee.skillSet.map(q => q.skill);
  }

  // Alle verfügbaren Qualifikationsnamen sortiert (für das Dropdown)
  availableSkillNames = computed(() =>
    this.qualificationsSignal().map(q => q.skill).sort()
  );

  // Mitarbeiterliste vom Backend laden
  fetchData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employeesSignal.set(employees);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Mitarbeiter:', err);
        this.errorMessage.set('Fehler beim Laden der Mitarbeiter. Bitte versuchen Sie es erneut.');
        this.isLoading.set(false);
      }
    });
  }

  // Mitarbeiter löschen nach Bestätigung
  deleteEmployee(employee: Employee): void {
    if (!confirm(`Möchten Sie ${employee.firstName} ${employee.lastName} wirklich löschen?`)) return;

    this.employeeService.deleteEmployee(employee).subscribe({
      next: () => {
        this.employeesSignal.update(list => list.filter(e => e.id !== employee.id));
      },
      error: (err) => {
        console.error('Löschen fehlgeschlagen:', err);
        this.errorMessage.set('Löschen fehlgeschlagen. Bitte erneut versuchen.');
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  navigateToAdd(): void {
    this.router.navigate(['/editEmployee']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/editEmployee', id]);
  }

  navigateToQualifications(): void {
    this.router.navigate(['/qualification']);
  }

  logout(): void {
    this.authService.logout();
  }

  // Modal öffnen – aktuelle Filter vorladen
  openFilterModal(): void {
    this.showQualDropdown.set(false);
    this.filterModel.set({ ...this.activeFilters() });
    this.showFilterModal.set(true);
  }

  closeFilterModal(): void {
    this.showFilterModal.set(false);
  }

  // Qualifikations-Dropdown umschalten
  toggleQualDropdown(): void {
    this.showQualDropdown.update(v => !v);
  }

  // Qualifikation auswählen oder deauswählen
  selectQualification(name: string): void {
    this.activeFilters.update(f => ({ ...f, skill: f.skill === name ? '' : name }));
    this.showQualDropdown.set(false);
  }

  // Filter aus dem Modal anwenden
  applyFilters(): void {
    this.activeFilters.set({ ...this.filterModel() });
    this.closeFilterModal();
  }

  // Alle Filter zurücksetzen
  resetFilters(): void {
    const empty: FilterState = { firstName: '', lastName: '', city: '', postcode: '', skill: '' };
    this.filterModel.set(empty);
    this.activeFilters.set(empty);
    this.showQualDropdown.set(false);
    this.closeFilterModal();
  }
}
