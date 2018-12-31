import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiusSearchComponent } from './radius-search.component';

describe('RadiusSearchComponent', () => {
  let component: RadiusSearchComponent;
  let fixture: ComponentFixture<RadiusSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadiusSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiusSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
