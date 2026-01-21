import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationListComponent } from './qualification-list.component';

describe('QualificationListComponent', () => {
  let component: QualificationListComponent;
  let fixture: ComponentFixture<QualificationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
