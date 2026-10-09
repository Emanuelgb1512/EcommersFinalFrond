import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminRegistroComponent } from './admin-registro.component';

describe('AdminRegistroComponent', () => {
  let component: AdminRegistroComponent;
  let fixture: ComponentFixture<AdminRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRegistroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRegistroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
