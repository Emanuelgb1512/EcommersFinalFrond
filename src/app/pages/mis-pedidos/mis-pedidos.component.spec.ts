import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisPedidosComponent } from './mis-pedidos.component';

describe('MisPedidosComponent', () => {
  let component: MisPedidosComponent;
  let fixture: ComponentFixture<MisPedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPedidosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MisPedidosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
