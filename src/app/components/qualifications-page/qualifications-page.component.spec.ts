import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationsPageComponent } from './qualifications-page.component';

describe('QualificationsPageComponent', () => {
  let component: QualificationsPageComponent;
  let fixture: ComponentFixture<QualificationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualificationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
