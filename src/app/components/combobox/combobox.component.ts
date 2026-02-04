import {Component, computed, input, output, signal} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {Qualification} from "../../model/qualification";
import {QualificationsApi} from "../../services/qualificationsApi";

@Component({
  selector: 'app-combobox',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  templateUrl: './combobox.component.html',
  styleUrl: './combobox.component.css'
})
export class ComboboxComponent {
  control = new FormControl<string>('', { nonNullable: true });

  options = input.required<string[]>();

  valueChanged = output<string>();

  filtered = computed(() => {
    const v = this.control.value.trim().toLowerCase();
    const opts = this.options();
    if (!v) return opts;
    return opts.filter(o => o.toLowerCase().includes(v));
  });

  canAdd = computed(() => {
    const v = this.control.value.trim();
    return v.length > 0 && !this.options().some(o => o.toLowerCase() === v.toLowerCase());
  });

  addCurrentValue() {
    const v = this.control.value.trim();
    if (!v) return;
    if (this.options().some(o => o.toLowerCase() === v.toLowerCase())) return;
    this.options().push(v);
  }

  pickAddOption() {
    this.addCurrentValue();
  }

  lostFocus() {
    console.log("emit");
    this.valueChanged.emit(this.control.value.trim());
  }
}

