import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Employee } from "../model/Employee";
import { EmployeeService } from "../services/employee.service";
import { QualificationsApi } from "../services/qualificationsApi";
import { Qualification } from "../model/qualification";

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {
  // Data signals
  private employeesSignal = signal<Employee[]>([]);
  private qualificationsSignal = signal<Qualification[]>([]);

  // UI state signals
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  showFilterModal = signal<boolean>(false);

  // Search control
  searchControl = new FormControl('', { nonNullable: true });
  searchTerm = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  // Filter state
  activeFilters = signal<FilterState>({
    firstName: '',
    lastName: '',
    city: '',
    postcode: '',
    skill: ''
  });

  // Filter Form Group
  filterForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true }),
    lastName: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    postcode: new FormControl('', { nonNullable: true }),
    skill: new FormControl('', { nonNullable: true })
  });

  // Prüfe ob das System Skills unterstützt (mindestens ein Mitarbeiter hat skillSet-Feld)
  hasSkillsSupport = computed(() => {
    return this.employeesSignal().some(e => e.skillSet !== undefined);
  });

  // Check if filters are active
  hasActiveFilters = computed(() => {
    const filters = this.activeFilters();
    return filters.firstName.trim() !== '' ||
           filters.lastName.trim() !== '' ||
           filters.city.trim() !== '' ||
           filters.postcode.trim() !== '' ||
           filters.skill.trim() !== '';
  });

  // Count active filters
  activeFilterCount = computed(() => {
    const filters = this.activeFilters();
    let count = 0;
    if (filters.firstName.trim()) count++;
    if (filters.lastName.trim()) count++;
    if (filters.city.trim()) count++;
    if (filters.postcode.trim()) count++;
    if (filters.skill.trim()) count++;
    return count;
  });

  // Computed filtered list (combines search + filters)
  filteredEmployees = computed(() => {
    let employees = this.employeesSignal();
    const term = this.searchTerm().toLowerCase().trim();
    const filters = this.activeFilters();

    // Apply search filter
    if (term) {
      employees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.phone.toLowerCase().includes(term) ||
        emp.street.toLowerCase().includes(term) ||
        emp.city.toLowerCase().includes(term) ||
        emp.postcode.includes(term)
      );
    }

    // Apply advanced filters
    if (filters.firstName.trim()) {
      const filterText = filters.firstName.toLowerCase().trim();
      employees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(filterText)
      );
    }

    if (filters.lastName.trim()) {
      const filterText = filters.lastName.toLowerCase().trim();
      employees = employees.filter(emp =>
        emp.lastName.toLowerCase().includes(filterText)
      );
    }

    if (filters.city.trim()) {
      const filterText = filters.city.toLowerCase().trim();
      employees = employees.filter(emp =>
        emp.city.toLowerCase().includes(filterText)
      );
    }

    if (filters.postcode.trim()) {
      const filterText = filters.postcode.trim();
      employees = employees.filter(emp =>
        emp.postcode.includes(filterText)
      );
    }

    if (filters.skill.trim()) {
      const filterText = filters.skill.toLowerCase().trim();
      employees = employees.filter(emp => {
        if (!emp.skillSet || emp.skillSet.length === 0) return false;
        const skillNames = this.getSkillNames(emp);
        return skillNames.some(skillName =>
          skillName.toLowerCase().includes(filterText)
        );
      });
    }

    return employees;
  });

  constructor(
    private employeeService: EmployeeService,
    private qualificationsApi: QualificationsApi,
    private router: Router
  ) {
    this.fetchData();
    this.fetchQualifications();
  }

  fetchQualifications(): void {
    this.qualificationsApi.getAllQualifications().subscribe({
      next: (qualifications) => {
        this.qualificationsSignal.set(qualifications);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Qualifikationen:', err);
      }
    });
  }

  /**
   * Mappt Skill-IDs zu Skill-Namen für einen Mitarbeiter
   */
  getSkillNames(employee: Employee): string[] {
    if (!employee.skillSet || employee.skillSet.length === 0) {
      return [];
    }
    const qualifications = this.qualificationsSignal();
    return employee.skillSet.map(id => {
      const qual = qualifications.find(q => q.id === Number(id));
      return qual ? qual.skill : `#${id}`;
    });
  }

  /**
   * Holt alle verfügbaren Skill-Namen für den Filter
   */
  availableSkillNames = computed(() => {
    return this.qualificationsSignal()
      .map(q => q.skill)
      .sort();
  });

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

  deleteEmployee(employee: Employee): void {
    const confirmMessage = `Möchten Sie ${employee.firstName} ${employee.lastName} wirklich löschen?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.employeesSignal.update(employees =>
          employees.filter(e => e.id !== employee.id)
        );
      },
      error: (err) => {
        console.error('Löschen fehlgeschlagen:', err);
        this.errorMessage.set('Löschen fehlgeschlagen. Bitte erneut versuchen.');

        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  navigateToAdd(): void {
    this.router.navigate(['/employees/add']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/employees/edit', id]);
  }

  openFilterModal(): void {
    // Set current active filters in form
    const filters = this.activeFilters();
    this.filterForm.patchValue(filters);
    this.showFilterModal.set(true);
  }

  closeFilterModal(): void {
    this.showFilterModal.set(false);
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;
    this.activeFilters.set({
      firstName: formValue.firstName || '',
      lastName: formValue.lastName || '',
      city: formValue.city || '',
      postcode: formValue.postcode || '',
      skill: formValue.skill || ''
    });
    this.closeFilterModal();
  }

  resetFilters(): void {
    this.filterForm.reset({
      firstName: '',
      lastName: '',
      city: '',
      postcode: '',
      skill: ''
    });
    this.activeFilters.set({
      firstName: '',
      lastName: '',
      city: '',
      postcode: '',
      skill: ''
    });
    this.closeFilterModal();
  }
}
